import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { iClient_taskeen, iRoom } from '../../../core/models/itaskeen';
import { TaskeenService } from '../../../core/services/taskeen.service';
import Swal from 'sweetalert2';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { EnumPipe } from "../../../shared/pipes/enum.pipe";


// Enums and Interfaces
enum StayType {
  SINGLE = 1,
  FAMILY = 2
}

enum Gender {
  MALE = 1,
  FEMALE = 2
}

interface Booking {
  id?: string;
  clientName: string;
  menCount: number;
  womenCount: number;
  totalCount: number;
  hotelName: string;
  bedsCountInRoom: number;
  // numOfRooms: number;
  numOfSingleBeds: number;
  fromDate: string;
  toDate: string;
  stayType: StayType;
  gender: Gender;
  invoiceNumber: string;
  employeeName: string;
  paymentMethod: number;
  remainingCount?: number;
  isFamily?: boolean;
  roomIndex?: number;
  memberIndex?: number;
  phoneNumber?: string;
  roomType?: 'family' | 'single';
  reservedRooms: iroomObj[];
  num_of_all_rooms: number;
  room_type_num_beds: number;
  all_rooms_for_res: any[];
  // clientName: string;
  // menCount: number;
  // womenCount: number;
  // totalCount: number;
  // hotelName: string;
  // bedsCountInRoom: number;
  // numOfRooms: number;
  // numOfSingleBeds: number;
  // fromDate: string;
  // toDate: string;
  // stayType: StayType;
  // gender: Gender;
  // invoiceNumber: string;
  // employeeName: string;
  // paymentMethod: number;
  // id?: string;
  // roomIndex?: number;
  // isFamily?: boolean;
  // remainingCount?: number;
  // memberIndex?: number;
}

interface Room {
  id: number;
  number: number;
  clients: Booking[];
  maxCapacity: number;
  roomType?: 'family' | 'single';
  isFullyOccupied?: boolean;
}
interface iroomObj {
  type: number;
  roomsCount: number;
}

@Component({
  selector: 'app-organize-taskeen',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, EnumPipe],
  templateUrl: './organize-taskeen.component.html',
  styleUrl: './organize-taskeen.component.scss'
})
export class OrganizeTaskeenComponent {
  constructor(private taskeenService: TaskeenService, private ActivatedRoute: ActivatedRoute) { }



  get_all_taskeen() {
    const { hotel_Id, fromDate, toDate } = this.ActivatedRoute.snapshot.queryParams;
    this.taskeenService.get_all_taskeen_org(hotel_Id, fromDate, toDate).subscribe((res: any) => {
      this.unassignedClients = res.data;
      this.sampleBookings = res.data;
      this.sampleBookings.forEach((booking) => {

        const reserved = booking.reservedRooms ?? [];

        booking.num_of_all_rooms = reserved
          .map(room => room.roomsCount || 0)
          .reduce((a, b) => a + b, 0);

        booking.all_rooms_for_res = reserved.flatMap(room =>
          Array(room.roomsCount || 0).fill({ type: room.type })
        );
      });
      console.log('this.sampleBookingssssssssssssss', this.sampleBookings);
      this.processBookings();
      this.updateStats();
      // this.expandClients(this.unassignedClients);
      // this.buildClientSections();
    })
  }


  // Sample data
  sampleBookings: Booking[] = [];

  // Application state
  familyClients: Booking[] = [];
  singleClients: Booking[] = [];
  rooms: Room[] = [];
  selectedClient: Booking | null = null;
  selectedClientType: 'family' | 'single' | null = null;
  selectedRoom: Room | null = null;

  // Stats
  totalClients = 0;
  assignedClients = 0;
  unassignedClients = 0;
  occupiedRooms = 0;
  showPhoneNumber = false;
  show_date = false;

  // UI states
  notificationMessage = '';
  showLoading = false;
  showNotifications = false;
  is_print_mode = false;

  ngOnInit(): void {
    this.get_all_taskeen()
    this.initializeRooms();
    // this.processBookings();
    this.updateStats();
  }

  // Initialize 20 empty rooms
  initializeRooms(): void {
    this.rooms = [];
    for (let i = 1; i <= 20; i++) {
      this.rooms.push({
        id: i,
        number: i,
        clients: [],
        maxCapacity: 4
      });
    }
  }

  add_new_rooms(): void {
    if (this.rooms.length >= 200) {
      this.showError('الحد الاقصى 200 غرفة', 'لا يمكن إضافة المزيد من الغرف');
      return;
    }
    for (let i = 1; i <= 20; i++) {
      this.rooms.push({
        id: this.rooms.length + 1,
        number: this.rooms.length + 1,
        clients: [],
        maxCapacity: 4
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'تم الاضافة بنجاح',
      text: 'تم إضافة 20 غرفة جديدة',
      showConfirmButton: true,
      confirmButtonText: 'حسناً'
    });
  }

  // Process bookings data
  processBookings(): void {
    this.familyClients = [];
    this.singleClients = [];

    this.sampleBookings.forEach(booking => {
      if (booking.stayType === StayType.FAMILY || booking.reservedRooms?.length > 0) {
        // Add family rooms based on numOfRooms
        for (let i = 0; i < (booking.all_rooms_for_res?.length || 0); i++) {
          this.familyClients.push({
            ...booking,
            id: `${booking.invoiceNumber}-room-${i + 1}`,
            roomIndex: i + 1,
            isFamily: true,
            room_type_num_beds: booking.all_rooms_for_res[i].type
            // room_type_num_beds: booking.reservedRooms[i].type
          });
        }
      } else {
        // Add single client with totalCount
        this.singleClients.push({
          ...booking,
          id: booking.invoiceNumber,
          remainingCount: booking.totalCount,
          isFamily: false
        });
      }
    });
  }




  // Auto assign single clients
  autoAssignSingles(): void {
    let assignedCount = 0;
    // console.log('this.singleClients', this.singleClients);
    // console.log('this.rooms', this.rooms);
    // const availableRoom = this.rooms.filter(room => room.clients.length < room.maxCapacity && room.roomType !== 'family');
    // console.log('availableRoom', availableRoom);
    // const availableSpaces = availableRoom.map(room => room.maxCapacity - room.clients.length ).reduce((a, b) => a + b, 0);
    // console.log('availableSpaces', availableSpaces);

    // الحصول علي عدد الاماكن الفارغة للعزاب 
    const availableSpaces = this.rooms.reduce((sum, room) =>
      (room.roomType !== 'family' && room.clients.length < room.maxCapacity)
        ? sum + (room.maxCapacity - room.clients.length)
        : sum
      , 0);
    console.log('availableSpaces', availableSpaces);

    if (this.singleClients.length > availableSpaces) {
      // alert(`تحذير: يوجد ${this.singleClients.length} عزاب و لكن متوفر فقط ${availableSpaces} أماكن فارغة`);

      Swal.fire({
        icon: 'warning',
        title: 'العدد اكبر من الاماكن المتاحة',
        text: `تحذير: يوجد ${this.singleClients.length} عزاب و لكن متوفر فقط ${availableSpaces} أماكن فارغة`,
        showConfirmButton: true,
        confirmButtonText: 'اضافة ورقة جديدة',
        cancelButtonText: 'إلغاء',
        showCancelButton: true

      }).then((result) => {
        if (result.isConfirmed) {
          this.add_new_rooms();
        }
      });

      return;
    }



    this.singleClients.forEach(client => {
      while ((client.remainingCount || 0) > 0) {
        // Find available room
        // console.log('rooms', this.rooms);
        const availableRoom = this.rooms.find(room => room.clients.length < room.maxCapacity && room.roomType !== 'family');

        // console.log(availableRoom);
        if (!availableRoom) {
          break; // No more available rooms
        }

        const availableSpaces = availableRoom.maxCapacity - availableRoom.clients.length;
        const toAssign = Math.min(client.remainingCount || 0, availableSpaces);

        // Assign clients to room
        for (let i = 0; i < toAssign; i++) {
          availableRoom.clients.push({
            ...client,
            memberIndex: i + 1
          });
          availableRoom.roomType = 'single';
        }


        client.remainingCount = (client.remainingCount || 0) - toAssign;
        assignedCount += toAssign;
      }
    });

    this.updateStats();
    this.showNotification(`تم تسكين ${assignedCount} شخص من العزاب تلقائياً`);
  }






  // Reset all assignments
  resetAssignment(): void {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع التسكينات؟')) {
      // Clear all rooms
      this.rooms.forEach(room => {
        room.clients = [];
        room.roomType = undefined;
        room.isFullyOccupied = false;
      });

      // Reprocess bookings
      this.processBookings();
      this.updateStats();
      this.showNotification('تم إعادة تعيين جميع التسكينات');
    }
  }

  // Update statistics
  updateStats(): void {
    this.totalClients = this.sampleBookings.reduce((sum, booking) => sum + booking.totalCount, 0);
    this.assignedClients = this.rooms.reduce((sum, room) => sum + room.clients.length, 0);
    this.unassignedClients = this.totalClients - this.assignedClients;
    this.occupiedRooms = this.rooms.filter(room => room.clients.length > 0).length;
  }

  // Show notification
  showNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotifications = true;

    setTimeout(() => {
      this.showNotifications = false;
    }, 3000);
  }


  // Helper to get stay type text
  getStayTypeText(stayType: StayType): string {
    return stayType === StayType.SINGLE ? 'عزاب' : 'عائلي';
  }

  // Helper to get gender text
  getGenderText(gender: Gender): string {
    return gender === Gender.MALE ? 'ذكر' : 'أنثى';
  }

  // Check if room is highlighted for drop
  isRoomHighlighted(room: Room): boolean {
    if (!this.selectedClient || !this.selectedClientType) {
      return false;
    }

    if (this.selectedClientType === 'family') {
      // Family needs empty room
      return room.clients.length === 0;
    } else {
      // Singles need available space
      return room.clients.length < room.maxCapacity && room.roomType !== 'family';
    }
  }

  // Check if client is selected
  isClientSelected(client: Booking): boolean {
    return this.selectedClient?.id === client.id;
  }



  FilterUnassignedSinglesPipe(singleClients: Booking[]) {

    return singleClients.filter(client => (client.remainingCount || 0) > 0);

  }


  // Select client
  selectClient(client: Booking, type: 'family' | 'single'): void {
    this.selectedClient = { ...client };
    this.selectedClientType = type;
    this.selectedRoom = null;
  }

  // في ملف الكومبوننت .ts

  // تعديل دالة assignClientToRoom
  // assignClientToRoom(room: Room): void {
  //   console.log('roommmmmmmmmmmmmmmmmmmmmm1111111', room);
  //   if (!this.selectedClient || !this.selectedClientType) {
  //     return;
  //   }

  //   const roomIndex = room.id - 1;
  //   console.log('roommmmmmmmmmmmmmmmmmmmmm22222', room);



  //   if (this.selectedClientType === 'family') {
  //     // Family client - assign as one unit (not repeated 4 times)
  //     if (room.clients.length > 0 || room.roomType === 'single') {
  //       // this.showNotification('الغرفة محجوزة مسبقاً! الغرف العائلية تحتاج غرفة فارغة كاملة.');
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'غرفة مشغولة',
  //         text: 'هذه الغرفة محجوزة مسبقاً! الحجز العائلي يحتاج غرفة فارغة كاملة.',
  //       });
  //       return;
  //     }


  //     console.log('roommmmmmmmmmmmmmmmmmmmmm33333333', room);
  //     // Add family booking as single entry with special flag
  //     this.rooms[roomIndex].clients.push({
  //       ...this.selectedClient,
  //       isFamily: true,
  //       roomType: 'family' // إضافة نوع الغرفة
  //     } as Booking);

  //     // Mark room as family occupied
  //     this.rooms[roomIndex].roomType = 'family';
  //     this.rooms[roomIndex].isFullyOccupied = true;

  //     this.familyClients = this.familyClients.filter(client => client.id !== this.selectedClient?.id);
  //     this.showNotification(`تم تسكين العائلة في الغرفة ${room.number}`);
  //     console.log('roommmmmmmmmmmmmmmmmmmmmm444444444', room);
  //   } else {
  //     // Single client - assign as many as possible to the room
  //     const availableSpaces = room.maxCapacity - room.clients.length;

  //     if (availableSpaces === 0) {
  //       alert('الغرفة ممتلئة!');
  //       return;
  //     } else if (room.roomType === 'family') {
  //       alert('الغرفة عائلي ممتلئة!');
  //       return;
  //     }

  //     const clientIndex = this.singleClients.findIndex(client => client.id === this.selectedClient?.id);
  //     if (clientIndex !== -1) {
  //       const toAssign = Math.min(this.selectedClient.remainingCount || 0, availableSpaces);

  //       // Add clients to room
  //       for (let i = 0; i < toAssign; i++) {
  //         this.rooms[roomIndex].clients.push({
  //           ...this.selectedClient,
  //           memberIndex: i + 1,
  //           isFamily: false,
  //           roomType: 'single'
  //         } as Booking);
  //       }

  //       // Mark room type as single
  //       this.rooms[roomIndex].roomType = 'single';

  //       // Reduce remaining count
  //       this.singleClients[clientIndex].remainingCount = (this.singleClients[clientIndex].remainingCount || 0) - toAssign;

  //       this.showNotification(`تم تسكين ${toAssign} من ${this.selectedClient.clientName} في الغرفة ${room.number}`);
  //     }
  //   }

  //   this.selectedClient = null;
  //   this.selectedClientType = null;
  //   this.updateStats();
  // }




  assignClientToRoom(room: Room): void {
    if (!this.selectedClient || !this.selectedClientType) return;

    if (this.selectedClientType === 'family') {
      this.assignFamilyToRoom(room);
    } else {
      this.assignSingleToRoom(room);
    }

    this.selectedClient = null;
    this.selectedClientType = null;
    this.updateStats();
  }

  private assignFamilyToRoom(room: Room): void {
    const roomIndex = room.id - 1;

    if (room.clients.length > 0 || room.roomType === 'single') {
      this.showError('الغرفة مشغولة', 'الحجز العائلي يحتاج غرفة فارغة بالكامل.');
      return;
    }

    this.rooms[roomIndex].clients.push({
      ...this.selectedClient!,
      isFamily: true,
      roomType: 'family'
    });

    this.rooms[roomIndex].roomType = 'family';
    this.rooms[roomIndex].isFullyOccupied = true;

    this.familyClients = this.familyClients.filter(
      client => client.id !== this.selectedClient!.id
    );

    this.showSuccess('تم التسكين ✅', `تم تسكين العائلة في الغرفة ${room.number}`);
  }

  private assignSingleToRoom(room: Room): void {
    const roomIndex = room.id - 1;

    if (room.roomType === 'family') {
      this.showError('الغرفة غير مناسبة', 'هذه الغرفة مخصصة لحجز عائلي.');
      return;
    }

    const availableSpaces = room.maxCapacity - room.clients.length;
    if (availableSpaces === 0) {
      this.showError('الغرفة ممتلئة', 'لا يوجد أماكن متاحة في هذه الغرفة.');
      return;
    }

    const clientIndex = this.singleClients.findIndex(
      client => client.id === this.selectedClient!.id
    );

    if (clientIndex === -1) return;

    const client = this.singleClients[clientIndex];
    const toAssign = Math.min(client.remainingCount || 0, availableSpaces);

    for (let i = 0; i < toAssign; i++) {
      this.rooms[roomIndex].clients.push({
        ...client,
        memberIndex: i + 1,
        isFamily: false,
        roomType: 'single'
      });
    }

    this.rooms[roomIndex].roomType = 'single';
    this.singleClients[clientIndex].remainingCount! -= toAssign;

    this.showSuccess('تم التسكين ✅', `تم تسكين ${toAssign} من ${client.clientName} في الغرفة ${room.number}`);
  }






  showroom(room: Room): void {
    // this.selectedRoom = room;
    console.log('this is room details', room);
  }
  // تعديل دالة removeClientFromRoom
  removeClientFromRoom(roomIndex: number, clientIndex: number): void {

    console.log('REMOVE roomIndex', roomIndex);
    console.log('REMOVE clientIndex', clientIndex);


    const client = this.rooms[roomIndex].clients[clientIndex];

    if (client.isFamily) {
      // Family client - remove the family entry
      this.rooms[roomIndex].clients = [];
      this.rooms[roomIndex].roomType = undefined;
      this.rooms[roomIndex].isFullyOccupied = false;

      // Return family client to list
      this.familyClients.unshift(client);
      this.showNotification(`تم إزالة العائلة من الغرفة ${roomIndex + 1}`);
    } else {
      // Single client - remove one person
      this.rooms[roomIndex].clients.splice(clientIndex, 1);

      // Check if room is now empty
      if (this.rooms[roomIndex].clients.length === 0) {
        this.rooms[roomIndex].roomType = undefined;
      }

      // Increase remaining count for single client
      const singleClientIndex = this.singleClients.findIndex(sc => sc.id === client.id);
      if (singleClientIndex !== -1) {
        this.singleClients[singleClientIndex].remainingCount = (this.singleClients[singleClientIndex].remainingCount || 0) + 1;
      } else {
        // Client not found, add back to list
        this.singleClients.unshift({
          ...client,
          remainingCount: 1
        });
      }
      this.showNotification(`تم إزالة شخص من ${client.clientName} من الغرفة ${roomIndex + 1}`);
    }

    this.updateStats();
  }

  // تعديل دالة autoAssignFamily
  autoAssignFamily(): void {
    const availableRooms = this.rooms.filter(room => room.clients.length === 0);
    const clientsToAssign = [...this.familyClients];

    if (clientsToAssign.length > availableRooms.length) {
      // alert(`تحذير: يوجد ${clientsToAssign.length} غرفة عائلية و ${availableRooms.length} غرفة فارغة فقط`);
      Swal.fire({
        icon: 'warning',
        title: 'العدد اكبر من الاماكن المتاحة',
        text: `تحذير: يوجد ${clientsToAssign.length} غرفة عائلية و لكن متوفر فقط ${availableRooms.length} أماكن فارغة`,
        showConfirmButton: true,
        confirmButtonText: 'اضافة ورقة جديدة',
        cancelButtonText: 'إلغاء',
        showCancelButton: true

      }).then((result) => {
        if (result.isConfirmed) {
          this.add_new_rooms();
        }
        if (result.isDismissed) {
          this.showNotification('تم إلغاء التسكين');
        }
      });
      return;

    }

    let assignedCount = 0;
    for (let i = 0; i < Math.min(clientsToAssign.length, availableRooms.length); i++) {
      const client = clientsToAssign[i];
      const room = availableRooms[i];

      // Add family as single entry
      room.clients.push({
        ...client,
        isFamily: true,
        roomType: 'family'
      });

      room.roomType = 'family';
      room.isFullyOccupied = true;
      assignedCount++;
    }

    // Remove assigned clients from family list
    this.familyClients = this.familyClients.slice(assignedCount);

    this.updateStats();
    this.showNotification(`تم تسكين ${assignedCount} غرفة عائلية تلقائياً`);
  }

  // تعديل دالة generatePDF
  generatePDF(): void {

    if (this.is_print_mode) {
      this.showLoading = true;
      window.print();
      setTimeout(() => {
        this.showLoading = false;
      }, 1000);
    } else {

      Swal.fire({
        title: 'هل تريد طباعة التقرير؟',
        text: 'يجب تفعيل وضع الطباعة اولا قبل طباعة التقرير',
        icon: 'question',
        // showCancelButton: true,
        confirmButtonText: 'حسناً',
        // cancelButtonText: 'لا'
      })
    }


  }

  // دالة جديدة لإنشاء محتوى الطباعة
  generatePrintContent(): string {
    const currentDate = new Date().toLocaleDateString('ar-EG');

    let content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #333; margin-bottom: 10px;">تقرير تنظيم التسكين - العمرة</h1>
      <p style="color: #666;">تاريخ الطباعة: ${currentDate}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
  `;

    this.rooms.forEach(room => {
      const roomClass = room.roomType === 'family' ? 'family-room' :
        room.roomType === 'single' ? 'single-room' : 'empty-room';

      content += `
      <div style="border: 2px solid ${room.roomType === 'family' ? '#4CAF50' : room.roomType === 'single' ? '#2196F3' : '#ccc'}; 
                  border-radius: 8px; padding: 10px; background-color: ${room.roomType === 'family' ? '#f1f8e9' : room.roomType === 'single' ? '#e3f2fd' : '#f5f5f5'};">
        <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
          غرفة ${room.number} 
          ${room.roomType === 'family' ? '(عائلية)' : room.roomType === 'single' ? '(عزاب)' : ''}
        </div>
        <div style="font-size: 11px; color: #666;">
    `;

      if (room.clients.length === 0) {
        content += 'غرفة فارغة';
      } else {
        room.clients.forEach(client => {
          if (client.isFamily) {
            content += `• ${client.clientName} (عائلة - ${client.invoiceNumber})<br>`;
          } else {
            content += `• ${client.clientName} (${client.invoiceNumber})<br>`;
          }
        });
      }

      content += `
        </div>
      </div>
    `;
    });

    content += `
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
      <h3 style="color: #333; margin-bottom: 10px;">إحصائيات التسكين</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #333;">${this.totalClients}</div>
          <div style="font-size: 11px; color: #666;">إجمالي العملاء</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #4CAF50;">${this.assignedClients}</div>
          <div style="font-size: 11px; color: #666;">المسكنين</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #FF9800;">${this.unassignedClients}</div>
          <div style="font-size: 11px; color: #666;">غير مسكنين</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #2196F3;">${this.occupiedRooms}</div>
          <div style="font-size: 11px; color: #666;">الغرف المشغولة</div>
        </div>
      </div>
    </div>
  `;

    return content;
  }

  // تعديل interface Room لإضافة خصائص جديدة
  // interface Room {
  //   id: number;
  //   number: number;
  //   clients: Booking[];
  //   maxCapacity: number;
  //   roomType?: 'family' | 'single';
  //   isFullyOccupied?: boolean;
  // }

  // تعديل interface Booking لإضافة خصائص جديدة
  // interface Booking {
  //   id?: string;
  //   clientName: string;
  //   menCount: number;
  //   womenCount: number;
  //   totalCount: number;
  //   hotelName: string;
  //   bedsCountInRoom: number;
  //   numOfRooms: number;
  //   numOfSingleBeds: number;
  //   fromDate: string;
  //   toDate: string;
  //   stayType: StayType;
  //   gender: Gender;
  //   invoiceNumber: string;
  //   employeeName: string;
  //   paymentMethod: number;
  //   remainingCount?: number;
  //   isFamily?: boolean;
  //   roomIndex?: number;
  //   memberIndex?: number;
  //   roomType?: 'family' | 'single';
  // }


  private showError(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#d33'
    });
  }

  private showSuccess(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 1500,
      showConfirmButton: false
    });
  }


}
