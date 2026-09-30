import { Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import API from '../axios';

export default function Navbar({ onMenuClick }) {
  const [name, setName] = useState();
  const [usrId, setUsrId] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/auth/me');
        setName(res.data.user.name);
        setUsrId(res.data.user.studentOrStaffId);
      } catch (err) {
        console.error('Fetch me error:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <header className="h-14 sm:h-16 bg-[#00C853] text-white flex items-center justify-between gap-3 px-4 sm:px-8 shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden -ml-2 p-2 rounded-lg hover:bg-white/15 transition cursor-pointer shrink-0"
        >
          <Menu size={22} />
        </button>
        <div className="font-medium tracking-wide truncate text-sm sm:text-base">
          P.I.M Equipment borrow system
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 bg-green-700 px-2.5 sm:px-3 py-1.5 rounded-full">
          <User className="shrink-0" />
          <div className="text-xs min-w-0">
            <p className="font-bold truncate max-w-[6rem] sm:max-w-[14rem]">{name}</p>
            <p className="text-[10px] text-green-200 hidden sm:block">{usrId}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
