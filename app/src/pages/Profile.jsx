import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
export default function Profile() {
    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#1E1E1E] font-sans">
          <Sidebar/>
          <main className = "flex-1 flex flex-col overflow-y-auto">
            <Navbar/>
          </main>
        </div>
      );
}