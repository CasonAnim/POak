import Equipment from '../models/Equipment.mjs';

// 1. ดึงข้อมูลอุปกรณ์ทั้งหมด
export const getAllEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find({});
    res.status(200).json(equipments);
  } catch (error) {
    console.error('Get Equipments Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์' });
  }
};

// 2. เพิ่มอุปกรณ์ใหม่
export const addEquipment = async (req, res) => {
  try {
    const { equipCode, name, type, totalQuantity, image, details } = req.body;

    if (!equipCode || !name || !type || totalQuantity === undefined) {
      return res.status(400).json({ message: 'กรุณากรอก รหัสอุปกรณ์, ชื่อ, ประเภท และจำนวนให้ครบถ้วน' });
    }

    const existingEquip = await Equipment.findOne({ equipCode });
    if (existingEquip) {
      return res.status(400).json({ message: 'รหัสอุปกรณ์นี้มีอยู่ในระบบแล้ว' });
    }

    const newEquipment = new Equipment({
      equipCode: equipCode.trim(),
      name: name.trim(),
      type,
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      image: req.file ? req.file.filename : (image || ''),
      details: details || '',
      status: 'พร้อมใช้งาน'
    });

    const savedEquip = await newEquipment.save();
    res.status(201).json({ message: 'เพิ่มอุปกรณ์สำเร็จ', equipmentId: savedEquip._id });
  } catch (error) {
    console.error('Add Equipment Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์' });
  }
};

// 3. อัปเดตข้อมูลอุปกรณ์
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // findByIdAndUpdate: อัปเดตข้อมูลทันทีและคืนค่าใหม่
    const updatedEquip = await Equipment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEquip) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการแก้ไข' });
    }

    res.status(200).json({ message: 'อัปเดตข้อมูลอุปกรณ์สำเร็จ', data: updatedEquip });
  } catch (error) {
    console.error('Update Equipment Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
};

// 4. ลบอุปกรณ์
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEquip = await Equipment.findByIdAndDelete(id);

    if (!deletedEquip) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
    }

    res.status(200).json({ message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (error) {
    console.error('Delete Equipment Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบอุปกรณ์' });
  }
};

// 5. แจ้งอุปกรณ์เสีย/ชำรุด/สูญหาย
export const reportIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issueType, quantity } = req.body; // 'ชำรุด' หรือ 'สูญหาย'

    if (!issueType || !quantity) {
      return res.status(400).json({ message: 'กรุณาระบุประเภทปัญหาและจำนวน' });
    }

    const updateQuery = {
      $inc: {
        availableQuantity: -Number(quantity),
        [issueType === 'ชำรุด' ? 'defectiveQuantity' : 'lostQuantity']: Number(quantity)
      }
    };

    const updatedEquip = await Equipment.findByIdAndUpdate(id, updateQuery, { new: true });

    if (!updatedEquip) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์' });
    }

    res.status(200).json({ message: `บันทึกสถานะ ${issueType} จำนวน ${quantity} รายการสำเร็จ` });
  } catch (error) {
    console.error('Report Issue Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแจ้งปัญหา' });
  }
};