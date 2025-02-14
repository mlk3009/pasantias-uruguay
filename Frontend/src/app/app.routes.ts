import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';



export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register-p1/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'restore',
    loadComponent: () =>
      import('./components/restore/restore.component').then(
        (m) => m.RestoreComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'publications',
    loadComponent: () =>
      import('./components/publications/publications.component').then(
        (m) => m.PublicationsComponent
      ),
  },
  {
    path: 'publications-in',
    loadComponent: () =>
      import('./components/publications-in/publications-in.component').then(
        (m) => m.PublicationsInComponent
      ),
  },
  {
    path: 'publications-in/:category',
    loadComponent: () =>
      import('./components/publications-in/publications-in.component').then(
        (m) => m.PublicationsInComponent
      ),
  },
  {
    path: 'register-p2',
    loadComponent: () =>
      import('./components/register/register-p2/register-p2.component').then(
        (m) => m.RegisterP2Component
      ),
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./components/students/students.component').then(
        (m) => m.StudentsComponent
      ),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./components/students/edit-profile/edit-profile.component').then(
        (m) => m.EditProfileComponent
      ),
  },
  {
    path: 'cv',
    loadComponent: () =>
      import('./components/cv/cv.component').then(
        (m) => m.CvComponent
      ),
  },
  {
    path: 'my-publications',
    loadComponent: () =>
      import('./components/enterprise/my-publications/my-publications.component').then(
        (m) => m.MyPublicationsComponent
      ),
  },
  {
    path: 'my-publications/:phone',
    loadComponent: () =>
      import('./components/enterprise/my-publications/my-publications.component').then(
        (m) => m.MyPublicationsComponent
      ),
  },
  {
    path: 'enterprise-profile',
    loadComponent: () =>
      import('./components/enterprise/enterprise.component').then(
        (m) => m.EnterpriseComponent
      ),
      //canActivate: [RoleGuard],
  },
{
    path: 'enterprise-profile/:phone',
    loadComponent: () =>
      import('./components/enterprise/enterprise.component').then(
        (m) => m.EnterpriseComponent
      ),
  },
  {
    path: 'user-profile/:phone',
    loadComponent: () =>
      import('./components/students/user-profile-view/user-profile-view.component').then((m) => m.UserProfileViewComponent),
  },
  {
    path: 'user-postulations',
    loadComponent: () =>
      import('./components/students/postulations/postulations.component').then(
        (m) => m.PostulationsComponent
      ),
  },
  {
    path: 'user-saves',
    loadComponent: () =>
      import('./components/students/saves/saves.component').then(
        (m) => m.SavesComponent
      ),
  },
  {
    path: 'abaut-us',
    loadComponent: () =>
      import('./components/abautus/abautus.component').then(
        (m) => m.AbautusComponent
      ),
  },
  {
    path: 'publication/:id',
    loadComponent: () =>
      import('./components/publication/publication.component').then(
        (m) => m.PublicationComponent
      ),
  },
  {
    path: 'postulantes',
    loadComponent: () =>
      import('./components/enterprise/postulantes/postulantes.component').then(
        (m) => m.PostulantesComponent
      ),
  },
  {
    path: 'register-enterprise-aclaration',
    loadComponent: () =>
      import('./components/register-enterprise/aclaration/aclaration.component').then(
        (m) => m.AclarationComponent
      ),
  },
  {
    path: 'enterprise-abaut-us',
    loadComponent: () =>
      import('./components/enterprise/abautus/abautus.component').then(
        (m) => m.AbautusComponent
      ),
      //canActivate: [RoleGuard],
  },
  {
    path: 'enterprise-abaut-us/:phone',
    loadComponent: () =>
      import('./components/enterprise/abautus/abautus.component').then(
        (m) => m.AbautusComponent
      ),
      //canActivate: [RoleGuard],
  },
  {
    path: 'register-enterprise-in-1',
    loadComponent: () =>
      import('./components/register-enterprise/register-in-1/register-in-1.component').then(
        (m) => m.RegisterIn1Component
      ),
  },
  {
    path: 'admin-profile',
    loadComponent: () =>
      import('./components/admin/user-admin-profile/user-admin-profile.component').then(
        (m) => m.UserAdminProfileComponent
      ),
  },
  {
    path: 'admin-users',
    loadComponent: () =>
      import('./components/admin/administrar-usuarios/administrar-usuarios.component').then(
        (m) => m.AdministrarUsuariosComponent
      ),
  },
//  {
 //   path: 'admin-categories',
 //   loadComponent: () =>
 //     import('./components/admin/administrar-categorias/administrar-categorias.component').then(
  //      (m) => m.AdministrarCategoriasComponent
 //     ),
 // },
  {
    path: 'admin-solicitudes',
    loadComponent: () =>
      import('./components/admin/administrar-solicitudes/administrar-solicitudes.component').then(
        (m) => m.AdministrarSolicitudesComponent
      ),
  },
  {
    path: 'admin-publications',
    loadComponent: () =>
      import('./components/admin/administrar-publicaciones/administrar-publicaciones.component').then(
        (m) => m.AdministrarPublicacionesComponent
      ),
  },
  {
    path: 'edit-enterprise-profile',
    loadComponent: () =>
      import('./components/enterprise/edit-enterprise-profile/edit-enterprise-profile.component').then(
        (m) => m.EditEnterpriseProfileComponent
      ),
  },
  // Dejar '**' siempre al final
  {
    path: '**',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },

];