import { useState, useEffect } from 'react';
import { Search, Plus, Atom } from 'lucide-react';
import AdminOnly from '../components/AdminOnly';
import API from '../axios';
import UploadModal from '../components/UploadModal';

// คอมโพเนนต์การ์ดและโมดอล
import EquipmentCard from '../components/EquipmentCard';
import BorrowModal from '../components/BorrowModal';

export default function ItemsToBorrowCason() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All items');
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ดึงรายการอุปกรณ์
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/equipments');

      // ตรวจสอบและดึง Array ข้อมูลออกมาให้ถูกต้องแน่นอน
      let items = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data && Array.isArray(res.data.equipments)) {
        items = res.data.equipments;
      } else if (res.data && Array.isArray(res.data.data)) {
        items = res.data.data;
      }

      console.log(items)

      setEquipments(items);
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
  const availableNow = equipments.filter(
    (i) => (Number(i.availableQuantity) || 0) > 0
  ).length;

  // รวบรวมหมวดหมู่ โดยดึงจากทั้ง category และ type (ครุภัณฑ์ / วัสดุสิ้นเปลือง)
  const categoriesList = [
    'All items',
    ...new Set(equipments.map((i) => i.type || i.category).filter(Boolean))
  ];

  // กรองค้นหา
  const filteredEquipments = equipments.filter((item) => {
    const itemName = (item.name || '').toLowerCase();
    const itemCode = (item.equipCode || item.code || '').toLowerCase();
    const itemCategory = item.type || item.category || '';

    const matchesSearch =
      itemName.includes(searchTerm.toLowerCase().trim()) ||
      itemCode.includes(searchTerm.toLowerCase().trim());

    const matchesCategory =
      selectedCategory === 'All items' || itemCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Banner */}
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
              <Atom />
            </div>
          </div>
        </div>
      </div>

      {/* สถิติ & ปุ่ม Add to library */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{totalCatalogued}</span>
          <span className="text-xs font-bold text-gray-500">Total items</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{availableNow}</span>
          <span className="text-xs font-bold text-gray-500">Available now</span>
        </div>

        <AdminOnly>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-full min-h-[50px] bg-gray-900 col-span-1 md:col-span-2 hover:bg-black border border-gray-200 text-white rounded-2xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Add to library</span>
          </button>
        </AdminOnly>
      </div>

      {/* แถบค้นหา และ หมวดหมู่ */}
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

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
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

      {/* ส่วนแสดง Equipment Cards */}
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
              onUpdated={fetchEquipments}
            />
          ))}
        </div>
      )}

      {/* Modal ยืมของ */}
      {selectedItemForBorrow && (
        <BorrowModal
          item={selectedItemForBorrow}
          onClose={() => setSelectedItemForBorrow(null)}
          onSuccess={() => {
            setSelectedItemForBorrow(null);
            fetchEquipments();
            alert('ส่งคำขอยืมสำเร็จ รอเจ้าหน้าที่อนุมัติ');
          }}
        />
      )}

      {/* Modal เพิ่มอุปกรณ์ (Admin) */}
      {isAddModalOpen && (
        <UploadModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchEquipments();
          }}
        />
      )}

      
    </div>
  );
}