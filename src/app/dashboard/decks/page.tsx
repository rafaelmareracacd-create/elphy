"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DecksView from "@/components/modules/anki/DecksView";
import CreateAnkiModal from "@/components/modules/anki/CreateAnkiModal";
import DeleteConfirmModal from "@/components/modules/planner/DeleteConfirmModal";
import Toast from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";
import AnkiNavbar from "@/components/modules/anki/AnkiNavbar";

interface Deck {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    cards_count: number;
    review_count: number;
}

export default function DecksPage() {
    const router = useRouter();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [allDecks, setAllDecks] = useState<any[]>([]); // All decks including sub-decks for the modal
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Modal State
    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: "" });

    useEffect(() => {
        fetchUser();
        fetchDecks();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const fetchDecks = async () => {
        setLoading(true);
        const nowISO = new Date().toISOString();

        try {
            // 1. Fetch All Decks
            const { data: allDecksData, error: decksError } = await supabase
                .from("decks")
                .select("*")
                .order("created_at", { ascending: false });

            if (allDecksData) setAllDecks(allDecksData);

            if (decksError) throw decksError;

            const decksData = allDecksData?.filter(d => !d.parent_id) || [];

            // 2. Fetch All Cards to Aggregate Stats
            // Fetch minimal fields needed for counting: deck_id and next_review
            const { data: cardsData, error: cardsError } = await supabase
                .from("flashcards")
                .select("deck_id, next_review, interval");

            if (cardsError) throw cardsError;

            const processedDecks = (decksData || []).map(deck => {
                const deckCards = cardsData?.filter(c => c.deck_id === deck.id) || [];
                const totalCards = deckCards.length;
                /*
                - Ensure main background is accurately set to `#121212`.
                - Audit Sidebar interactions for consistency with the requested premium theme.
                
                ---
                
                ### 8. Planner Module (Cronograma)
                #### [MODIFY] [Planner.tsx](file:///C:/Users/Rafael%20Marera/OneDrive/%C3%81rea%20de%20Trabalho/Antigravity/src/components/modules/Planner.tsx)
                - Update main container with `bg-[#121212]`.
                
                #### [MODIFY] [PlannerBoard.tsx](file:///C:/Users/Rafael%20Marera/OneDrive/%C3%81rea%20de%20Trabalho/Antigravity/src/components/modules/planner/PlannerBoard.tsx)
                - **DAYS definition**: Update `bg-emerald-50` to `bg-emerald-500/10`, `text-emerald-700` to `text-emerald-400`, and `border-emerald-200` to `border-emerald-500/20`.
                - **Action Bar & Total Bar**: Change `bg-white/50 border-gray-100` to `bg-white/5 border-white/5 backdrop-blur-md`.
                - **Scroll Buttons**: Update hover states to `hover:bg-white/10` and colors.
                
                #### [MODIFY] [PlannerColumn.tsx](file:///C:/Users/Rafael%20Marera/OneDrive/%C3%81rea%20de%20Trabalho/Antigravity/src/components/modules/planner/PlannerColumn.tsx) & [MattersColumn.tsx](file:///C:/Users/Rafael%20Marera/OneDrive/%C3%81rea%20de%20Trabalho/Antigravity/src/components/modules/planner/MattersColumn.tsx)
                - **Container**: Change `bg-white` to `bg-[#1e1e1e]` and `border-gray-100` to `border-white/5 shadow-2xl shadow-black/50`.
                - **Header**: Change `bg-emerald-50/30` to `bg-emerald-500/10` and title color `text-emerald-950` to `text-white`.
                - **Badges**: Update duration/card count badges to `bg-white/5 border-white/10 text-emerald-400`.
                - **Empty State**: Change `border-gray-100 text-gray-300` to `border-white/5 text-slate-600`.
                - **Action Buttons**: Update "Adicionar" / "Nova Matéria" to use `text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10`.
                
                #### [MODIFY] [PlannerCard.tsx](file:///C:/Users/Rafael%20Marera/OneDrive/%C3%81rea%20de%20Trabalho/Antigravity/src/components/modules/planner/PlannerCard.tsx)
                - **Dragging State**: Change `border-gray-300 bg-gray-50` to `border-white/10 bg-white/5`.
                - **Text Appearance**: Ensure text contrast and readability against task colors in dark mode.
                */
                // Count Reviews: Cards where next_review <= now OR next_review is null (new cards might be considered due immediately depending on logic, but usually new are "New")
                // Based on previous logic: 
                // Due = next_review <= nowISO
                // But traditionally in Anki, "To Review" usually means Due Reviews (Green). New cards (Blue) are separate.
                // The screenshot shows "0 para revisar".
                // Let's count "Due" cards (excluding New if New means interval 0 and we want to separate them, but simpler is just all Due).
                // Let's count anything with next_review <= now as "Due".
                const reviewCount = deckCards.filter(c => {
                    if (!c.next_review) return true; // Default to due if null? Or is it New?
                    return c.next_review <= nowISO;
                }).length;

                return {
                    ...deck,
                    description: deck.description || "",
                    cards_count: totalCards,
                    review_count: reviewCount
                };
            });

            setDecks(processedDecks);

        } catch (error) {
            console.error("Error fetching decks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDeck = async (data: any) => {
        if (!userId) {
            setToast({ isVisible: true, message: "Você precisa estar logado para criar baralhos" });
            return;
        }
        try {
            const { data: newDeck, error } = await supabase.from("decks").insert({
                name: data.name,
                color: data.color,
                icon: data.icon,
                user_id: userId
            }).select().single();

            if (error) throw error;

            if (newDeck) {
                setDecks(prev => [{ ...newDeck, cards_count: 0, review_count: 0, description: "" }, ...prev]);
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error("Error creating deck:", error);
        }
    };

    const handleCreateCard = async (data: any) => {
        if (!userId) {
            setToast({ isVisible: true, message: "Você precisa estar logado para criar cards" });
            return;
        }
        try {
            const { error } = await supabase.from("flashcards").insert({
                front: data.front,
                back: data.back,
                deck_id: data.deckId,
                user_id: userId,
                tags: data.tags ? [data.tags] : []
            });

            if (error) throw error;

            // Re-fetch or simplistic update? 
            // A new card is usually "New", so it might count as "Due" depending on settings.
            // Let's just re-fetch to be safe and accurate or simpler update:
            setDecks(prev => prev.map(d =>
                d.id === data.deckId
                    ? { ...d, cards_count: (d.cards_count || 0) + 1, review_count: (d.review_count || 0) + 1 } // Assuming new card is immediately due
                    : d
            ));

            setToast({ isVisible: true, message: "Card criado com sucesso!" });
        } catch (error) {
            console.error("Error creating card:", error);
        }
    };

    const handleDeleteDeck = (deckId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeckToDelete(deckId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deckToDelete) return;

        try {
            const { error } = await supabase
                .from("decks")
                .delete()
                .eq("id", deckToDelete);

            if (error) throw error;

            setDecks(prev => prev.filter(d => d.id !== deckToDelete));
            setDeleteModalOpen(false);
            setDeckToDelete(null);
        } catch (error) {
            console.error("Error deleting deck:", error);
        }
    };

    const handleUpdateDeckIcon = async (deckId: string, icon: string) => {
        try {
            const { error } = await supabase
                .from("decks")
                .update({ icon })
                .eq("id", deckId);

            if (error) throw error;

            // Update local state
            setDecks(prev => prev.map(d => d.id === deckId ? { ...d, icon } : d));
            setToast({ isVisible: true, message: "Ícone atualizado!" });
        } catch (error) {
            console.error("Error updating deck icon:", error);
            setToast({ isVisible: true, message: "Erro ao atualizar ícone" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] flex flex-col">
            {/* Reusing AnkiNavbar for consistency. 
                 Note: DecksPage doesn't have a sidebar or elapsed time context typically, 
                 so we pass defaults or simple toggles if we want to support them later. 
             */}
            <AnkiNavbar
                onOpenAddModal={() => setShowCreateModal(true)}
                sidebarOpen={false} // No sidebar in decks view currently
                setSidebarOpen={() => { }} // No-op
                elapsedTime={0}
                showSidebarToggle={false}
            />
            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <DecksView
                    decks={decks}
                    onSelectDeck={(deckId) => router.push(`/dashboard/anki?deck=${deckId}`)} // Estudar
                    onManageDeck={(deckId) => router.push(`/dashboard/decks/${deckId}`)} // Gerenciar
                    onCreateDeck={() => setShowCreateModal(true)}
                    onDeleteDeck={handleDeleteDeck}
                    onUpdateDeckIcon={handleUpdateDeckIcon}
                    hideHeader={false} // Show header for title
                    showCreateButton={true}
                    showBackButton={false} // Navbar manages navigation
                />
            )}

            <CreateAnkiModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateDeck={handleCreateDeck}
                onCreateCard={handleCreateCard}
                decks={allDecks}
                initialTab="deck"
                deckOnly={true}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Baralho"
                description="Tem certeza que deseja excluir este baralho? Todos os cards e sub-baralhos dentro dele também serão excluídos permanentemente."
            />

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
