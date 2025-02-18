import { Component, OnInit } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-administrar-usuarios',
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule], 
  templateUrl: './administrar-usuarios.component.html',
  styleUrl: './administrar-usuarios.component.css'
})
export class AdministrarUsuariosComponent implements OnInit {
  data: any = {};
  users: any[] = [];
  displayedUsers: any[] = [];
  selectedUserId: number | null = null;
  selectedUser: any = null;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  totalUsers: number = 0;
  userimage: string = 'http://localhost:8000/images/user.png';
  searchParams: any = {
    name: '',
    location: '',
    rol: ''
  };

  constructor(
    private _userService: UserService,
    private _adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          this.getAllUsers();
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  getAllUsers(page: number = 1): void {
    this._adminService.getAllUsers(page, this.itemsPerPage).subscribe(
      (response) => {
        this.users = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.total_pages;
        this.totalUsers = response.total_users; // Asegúrate de que el backend devuelva el número total de usuarios
        this.updateDisplayedUsers();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  updateDisplayedUsers(): void {
    this.displayedUsers = this.users;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllUsers(this.currentPage);
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllUsers(this.currentPage);
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalUsers);
  }

  modalDelete(userId: number): void {
    this.selectedUserId = userId;
    this.selectedUser = this.users.find(user => user.id === userId);
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose(): void {
    this.selectedUserId = null;
    this.selectedUser = null;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalBan(userId: number): void {
    this.selectedUserId = userId;
    this.selectedUser = this.users.find(user => user.id === userId);
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalBanClose(): void {
    this.selectedUserId = null;
    this.selectedUser = null;
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'none';
  }

  deactivateUser(id: number | null): void {
    if (id !== null) {
      this._adminService.deactivateUser(id).subscribe(
        (response) => {
          console.log('User deactivated:', response);
          this.getAllUsers(this.currentPage); // Refresh the users list
          this.modalBanClose(); // Close the modal
        },
        (error) => {
          console.error('Error deactivating user:', error);
        }
      );
    }
  }

  deleteUser(id: number | null): void {
    if (id !== null) {
      this._adminService.deleteUser(id).subscribe(
        (response) => {
          console.log('User deleted:', response);
          this.getAllUsers(this.currentPage); // Refresh the users list
          this.modalDeleteClose(); // Close the modal
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  searchUsers(): void {
    this._adminService.searchUsers(this.searchParams).subscribe(
      (response) => {
        this.users = response;
        this.updateDisplayedUsers();
      },
      (error) => {
        console.error('Error searching users:', error);
      }
    );
  }
}