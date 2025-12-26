import AdminUpload from "@/components/admin/AdminUpload";

export default function AdminPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <AdminUpload />
        </div>
    );
}
