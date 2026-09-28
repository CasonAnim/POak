
import { Bell ,User } from 'lucide-react';
import { useEffect , useState} from 'react';
import API from '../axios'

export default function Navbar() {

  const [name, setName] = useState()
  const [usrId, setUsrId] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/auth/me')
        console.log(res.data)
         
        setName(res.data.user.name)
        setUsrId(res.data.user.studentOrStaffId)
      } catch (error) {
        console.error('Fetch me error:', err);
      }
      
    }; 
    
    fetchData()
  } ,[])

  return (
    <header className="h-16 bg-[#00C853] text-white flex items-center justify-between px-8 shadow-sm">
      <div className="font-medium tracking-wide">P.I.M Equipment borrow system</div>
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 bg-green-700 px-3 py-1.5 rounded-full">
          <User />
          <div className="text-xs">
            <p className="font-bold">{name}</p>
            <p className="text-[10px] text-green-200">{usrId}</p>
          </div>
        </div>
      </div>
    </header>
  );
}