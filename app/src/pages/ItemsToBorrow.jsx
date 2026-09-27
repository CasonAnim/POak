import  { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import API from '../axios';

// คอมโพเนนต์หลักเดิมที่มีอยู่แล้ว
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';

// คอมโพเนนต์ใหม่สำหรับหน้า Library
import EquipmentCard from '../components/EquipmentCard';
import BorrowModal from '../components/BorrowModal';

export default function ItemsToBorrow() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All items');
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState(null);
  const [showNotice, setShowNotice] = useState(true);

  // ดึงรายการอุปกรณ์
  const fetchEquipments = async () => {
    try {
      const res = await API.get('/equipments');
      const data = Array.isArray(res.data) ? res.data : (res.data.equipments || []);
      setEquipments(data);
    } catch (err) {
      console.error('Error fetching equipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  // คำนวณสรุป
  const totalCatalogued = equipments.length;
  const availableNow = equipments.filter(i => (Number(i.availableQuantity) || 0) > 0).length;
  const categoriesList = ['All items', ...new Set(equipments.map(i => i.category || i.type).filter(Boolean))];
  const subCategoriesCount = new Set(equipments.map(i => i.category || i.type).filter(Boolean)).size;

  // กรองค้นหา
  const filteredEquipments = equipments.filter((item) => {
    const itemName = item.name || '';
    const itemCode = item.code || item.equipCode || '';
    const itemCategory = item.category || item.type || '';

    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All items' || itemCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1E1E1E] font-sans">
      
      <Sidebar />

      {/* 2. Content ฝั่งขวา */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* แบนเนอร์สีเขียว */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 text-white p-10 shadow-sm">
            <div className="relative z-10 max-w-xl">
              <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold mb-2">
                Reference Library
              </p>
              <h1 className="text-4xl font-serif font-bold tracking-tight mb-3">
                Science, borrow at hand.
              </h1>
              <p className="text-sm text-emerald-100 font-light leading-relaxed">
                A quick index of equipment, specimens, and field tools for your next experiment.
              </p>
            </div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-emerald-400/30 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-emerald-300/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center text-2xl font-light">
                  ⚛
                </div>
              </div>
            </div>
          </div>

          {/* แจ้งเตือนจำนวนชิ้น */}
          {showNotice && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>
                  <strong>{totalCatalogued} items</strong> are catalogued in your personal collection.
                </span>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* สรุปสถิติ 3 ช่อง */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {String(totalCatalogued).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-500">catalogued items</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {String(availableNow).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-500">available now</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {String(subCategoriesCount).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-500">sub-categories</span>
            </div>
            <button className="h-full min-h-[60px] bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition cursor-pointer shadow-sm">
              <Plus size={16} />
              <span>Add to library</span>
            </button>
          </div>

          {/* ค้นหาและแท็บตัวกรอง */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search equipment, specimens, or IDs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* รายการการ์ด */}
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500">
              กำลังโหลดรายการอุปกรณ์...
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400 bg-white border border-gray-200 rounded-2xl">
              ไม่พบรายการอุปกรณ์ที่ค้นหา
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEquipments.map((item) => (
                <EquipmentCard
                  key={item._id}
                  item={item}
                  onBorrowClick={(clickedItem) => setSelectedItemForBorrow(clickedItem)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal ฟอร์มยืมของ เมื่อกด Open item */}
      {selectedItemForBorrow && (
        <BorrowModal
          item={selectedItemForBorrow}
          onClose={() => setSelectedItemForBorrow(null)}
          onSuccess={() => {
            setSelectedItemForBorrow(null);
            fetchEquipments(); // โหลดข้อมูลใหม่เพื่อให้ตัวเลขคงเหลือตัดอัตโนมัติ
            alert('ส่งคำขอยืมสำเร็จ รอเจ้าหน้าที่อนุมัติ');
          }}
        />
      )}
    </div>
  );
}