import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // อนุญาตให้ใช้ปุ่ม Link เปลี่ยนหน้าได้
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private titleService: Title, 
    private metaService: Meta
  ) {}

  ngOnInit() {
    // 1. ตั้งชื่อแท็บเว็บ (Title) ที่จะไปโชว์ตัวใหญ่ๆ ในหน้าค้นหาของ Google
    this.titleService.setTitle('แอปพลิเคชัน AI จำแนกสายพันธุ์จิ้งหรีดแม่นยำสูง | ThaiCricket AI');

    // 2. ใส่คำอธิบายเว็บ (Description)
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'อัปโหลดไฟล์เสียงร้องของจิ้งหรีดเพื่อวิเคราะห์และแยกสายพันธุ์ด้วยโมเดล AI (CNN) ฟรี รองรับ 5 สายพันธุ์หลักในไทย เช่น จิ้งหรีดทองดำ, จิ้งหรีดทองแดง' 
    });

    // 3. ใส่คีย์เวิร์ด (Keywords)
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'จิ้งหรีด, แยกเสียงจิ้งหรีด, AI จิ้งหรีด, แมลงเศรษฐกิจ, จิ้งหรีดทองดำ, จิ้งหรีดทองแดง' 
    });
  }
}