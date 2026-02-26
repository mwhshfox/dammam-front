import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [

    {
        path: '', canActivate: [AuthGuard],
        loadComponent: () => import('./layout/main/main.component').then((m) => m.MainComponent),
        title: 'dashboard',
        children: [
            {
                path: '', redirectTo: "home", pathMatch: "full"
            },
            {
                path: 'home',
                loadComponent: () => import('./components/home/home/home.component').then((m) => m.HomeComponent),
                title: 'Home',
            },
            {
                path: 'admin',
                loadComponent: () => import('./components/admin/admin-page/admin-page.component').then((m) => m.AdminPageComponent),
                title: 'Admin',
                children: [
                    {
                        path: '', redirectTo: "all-admins", pathMatch: "full"
                    },
                    {
                        path: 'all-admins',
                        loadComponent: () => import('./components/admin/all-admins/all-admins.component').then((m) => m.AllAdminsComponent),
                        title: 'all admins',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/admin/new-admin/new-admin.component').then((m) => m.NewAdminComponent),
                        title: 'add new admin',
                    },
                    {
                        path: 'edit',
                        loadComponent: () => import('./components/admin/edit/edit.component').then((m) => m.EditComponent),
                        title: 'update admin',
                    }
                ]
            },
            {
                path: 'employees',
                loadComponent: () => import('./components/employees/employee-page/employee-page.component').then((m) => m.EmployeePageComponent),
                title: 'All-employees',
                children: [
                    {
                        path: '', redirectTo: "all-employees", pathMatch: "full"
                    },
                    {
                        path: 'all-employees',
                        loadComponent: () => import('./components/employees/all-employees/all-employees.component').then((m) => m.AllEmployeesComponent),
                        title: 'all employees',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/employees/add-employee/add-employee.component').then((m) => m.AddEmployeeComponent),
                        title: 'add new employee',
                    },
                    {
                        path: 'edit',
                        loadComponent: () => import('./components/employees/edit-employee/edit-employee.component').then((m) => m.EditEmployeeComponent),
                        title: 'update employee',
                    }
                ]
            },
            {
                path: 'payments',
                loadComponent: () => import('./components/payment/payment-page/payment-page.component').then((m) => m.PaymentPageComponent),
                title: 'All-payments',
                children: [
                    {
                        path: '', redirectTo: "all-payments", pathMatch: "full"
                    },
                    {
                        path: 'all-payments',
                        loadComponent: () => import('./components/payment/all-payments/all-payments.component').then((m) => m.AllPaymentsComponent),
                        title: 'all payments',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/payment/add-payment/add-payment.component').then((m) => m.AddPaymentComponent),
                        title: 'add new payment',
                    },
                    {
                        path: 'show-invoice/:id',
                        loadComponent: () => import('./components/reports/show-invoice/show-invoice.component').then((m) => m.ShowInvoiceComponent),
                        title: 'show-invoice',
                    },
                    // {
                    //     path: 'edit',
                    //     loadComponent: () => import('./components/payment/edit-payment/edit-payment.component').then((m) => m.EditPaymentComponent),
                    //     title: 'update payment',
                    // }
                ]
            },
            {
                path: 'clients',
                loadComponent: () => import('./components/clients/client-page/client-page.component').then((m) => m.ClientPageComponent),
                title: 'All-clients',
                children: [
                    {
                        path: '', redirectTo: "all-clients", pathMatch: "full"
                    },
                    {
                        path: 'all-clients',
                        loadComponent: () => import('./components/clients/all-clients/all-clients.component').then((m) => m.AllClientsComponent),
                        title: 'all clients',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/clients/add-client/add-client.component').then((m) => m.AddClientComponent),
                        title: 'add new client',
                    },
                    {
                        path: 'edit',
                        loadComponent: () => import('./components/clients/edit-client/edit-client.component').then((m) => m.EditClientComponent),
                        title: 'update client',
                    }
                ]
            },
            // {
            //     path: 'buses',
            //     loadComponent: () => import('./shared/components/buses/buses.component').then((m) => m.BusesComponent),
            //     title: 'buses',
            // },
            {
                path: 'reservations',
                loadComponent: () => import('./components/reservations/all-reservations/all-reservations.component').then((m) => m.AllReservationsComponent),
                title: 'All-Reservations',
            },
            {
                path: 'reservations/deleted',
                loadComponent: () => import('./components/reservations/all-reservations/all-reservations.component').then((m) => m.AllReservationsComponent),
                title: 'Deleted Reservations',
            },
            {
                path: 'Add-Reservation',
                loadComponent: () => import('./components/reservations/add-edit-reservation/add-edit-reservation.component').then((m) => m.AddEditReservationComponent),
                title: 'Add-Reservation',
            },
            {
                path: 'Add-Reservation/:trip_id',
                loadComponent: () => import('./components/reservations/add-edit-reservation/add-edit-reservation.component').then((m) => m.AddEditReservationComponent),
                title: 'Add-Reservation',
            },
            {
                path: 'show-Reservation/:reservation_id',
                loadComponent: () => import('./components/reservations/show-reservation-by-id/show-reservation-by-id.component').then((m) => m.ShowReservationByIdComponent),
                title: 'show-Reservation',
            },
            {
                path: 'show-deleted-Reservation/:reservation_id',
                loadComponent: () => import('./components/reservations/show-reservation-by-id/show-reservation-by-id.component').then((m) => m.ShowReservationByIdComponent),
                title: 'show-deleted-Reservation',
            },
            {
                path: 'Edit-Reservation/:reservation_id',
                loadComponent: () => import('./components/reservations/edit-reservation/edit-reservation.component').then((m) => m.EditReservationComponent),
                title: 'Edit-Reservation',
            },
            {
                path: 'trips',
                loadComponent: () => import('./components/trips/trip-page/trip-page.component').then((m) => m.TripPageComponent),
                // loadComponent: () => import('./components/trips/all-trips/all-trips.component').then((m) => m.AllTripsComponent),
                title: 'All-trips',
                children: [
                    {
                        path: '', redirectTo: "all-trips", pathMatch: "full"
                    },
                    {
                        path: 'all-trips',
                        loadComponent: () => import('./components/trips/all-trips/all-trips.component').then((m) => m.AllTripsComponent),
                        title: 'all trips',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/trips/add-trip/add-trip.component').then((m) => m.AddTripComponent),
                        title: 'add new trip',
                    },
                    {
                        path: 'edit/:trip_id',
                        loadComponent: () => import('./components/trips/edit-trip/edit-trip.component').then((m) => m.EditTripComponent),
                        title: 'update trip',
                    }
                ]
            },
            {
                path: 'hotels',
                loadComponent: () => import('./components/hotels/hotel-page/hotel-page.component').then((m) => m.HotelPageComponent),
                // loadComponent: () => import('./components/hotels/all-hotels/all-hotels.component').then((m) => m.AllHotelsComponent),

                title: 'All-hotels',
                children: [
                    {
                        path: '', redirectTo: "all-hotels", pathMatch: "full"
                    },
                    {
                        path: 'all-hotels',
                        loadComponent: () => import('./components/hotels/all-hotels/all-hotels.component').then((m) => m.AllHotelsComponent),
                        title: 'all hotels',
                    },
                    {
                        path: 'add-new',
                        loadComponent: () => import('./components/hotels/add-hotel/add-hotel.component').then((m) => m.AddHotelComponent),
                        title: 'add new hotel',
                    },
                    {
                        path: 'edit',
                        loadComponent: () => import('./components/hotels/edit-hotel/edit-hotel.component').then((m) => m.EditHotelComponent),
                        title: 'update hotel',
                    }
                ]
            },
            {
                path: 'reports',
                loadComponent: () => import('./components/reports/reports-page/reports-page.component').then((m) => m.ReportsPageComponent),
                title: 'All-reports',
                children: [
                    {
                        path: '', redirectTo: "all-reports", pathMatch: "full"
                    },
                    {
                        path: 'all-reports',
                        loadComponent: () => import('./components/reports/all-reports/all-reports.component').then((m) => m.AllReportsComponent),
                        title: 'all reports',
                    },
                    {
                        path: 'trips-reports/:report_type',
                        loadComponent: () => import('./components/reports/trips-reports/trips-reports.component').then((m) => m.TripsReportsComponent),
                        title: 'trips reports',
                    }
                    // {
                    //     path: 'add-new',
                    //     loadComponent: () => import('./components/reports/add-report/add-report.component').then((m) => m.AddReportComponent),
                    //     title: 'add new report',
                    // },
                    // {
                    //     path: 'edit',
                    //     loadComponent: () => import('./components/reports/edit-report/edit-report.component').then((m) => m.EditReportComponent),
                    //     title: 'update report',
                    // }
                ]
            },
            {
                path: 'update-password',
                loadComponent: () => import('./components/auth/update-password/update-password.component').then((m) => m.UpdatePasswordComponent),
                title: 'update-password',
            },

            {
                path: 'update-user-password/:user_id',
                loadComponent: () => import('./components/auth/update-user-password/update-password.component').then((m) => m.UpdatePasswordComponent),
                title: 'update-password',
            },

            {
                path: 'all-taskeen',
                loadComponent: () => import('./components/taskeen/all-taskeen/all-taskeen.component').then((m) => m.AllTaskeenComponent),
                title: 'all-taskeen',
            },
            {
                path: 'cashflow',
                loadComponent: () => import('./cashflow/all-operations/all-operations.component').then((m) => m.AllOperationsComponent),
                title: 'cashflow',
            },
            {
                path: 'cashflow-users',
                loadComponent: () => import('./cashflow/operation-page/operation-page.component').then((m) => m.OperationPageComponent),
                title: 'cashflow-users',
            },
            {
                path: 'days-report/:report_type',
                loadComponent: () => import('./components/reports/days-report/days-report.component').then((m) => m.DaysReportComponent),
                title: 'days-report',
            },

            // {
            //     path: 'show-invoice/:reservation_id',
            //     loadComponent: () => import('./components/reports/show-invoice/show-invoice.component').then((m) => m.ShowInvoiceComponent),
            //     title: 'show-invoice',
            // },
        ]
    },
    {
        path: 'organize-taskeen', canActivate: [AuthGuard],
        loadComponent: () => import('./components/taskeen/organize-taskeen/organize-taskeen.component').then((m) => m.OrganizeTaskeenComponent),
        title: 'organize-taskeen',
    },

    {
        path: 'print-show-invoice/:id',
        loadComponent: () => import('./components/reports/show-invoice/show-invoice.component').then((m) => m.ShowInvoiceComponent),
        title: 'show-invoice',
    },

    {
        path: 'about-us',
        loadComponent: () => import('./components/about-us/about-us.component').then((m) => m.AboutUsComponent),
        title: 'About Us',
    },

    {
        path: 'login',
        loadComponent: () => import('./components/auth/sign-in/sign-in.component').then((m) => m.SignInComponent),
        title: 'login',
    },



];
