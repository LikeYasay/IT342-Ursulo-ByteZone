````md
# ByteZone

**ByteZone** is a computer café management system designed to centralize customer accounts, station booking, station session timing, snack ordering, announcements, payment tracking, transaction history, and role-based staff/admin operations in one integrated platform.

This project was developed for **IT342 - System Integration and Architecture**.

---

## Project Information

| Field | Details |
|---|---|
| Project Name | ByteZone |
| Domain | Computer Café Management System |
| Course | IT342 - System Integration and Architecture |
| Developer | Ursulo, Lichael Yashua E. |
| Course and Year | BSIT - 3 |
| Section | G1 |
| Repository | `IT342-Ursulo-ByteZone` |
| Backend Deployment | Render |
| Web Deployment | Vercel |
| Database Hosting | Supabase PostgreSQL |
| Mobile Platform | Android Kotlin XML |

---

## Deployed Links

### Web Frontend

```text
https://it-342-ursulo-byte-zone.vercel.app

````

### Backend API

```text
https://bytezone-backend.onrender.com
```

> Note: The backend is hosted on Render Free Tier, so the first request may take a few seconds if the service has been inactive.

---

## Project Overview

ByteZone is built to help computer cafés manage operations that are usually handled manually or through disconnected tools. The system supports customers, staff, and admins by providing one platform for:

* User registration and login
* Google OAuth login
* Role-based dashboards
* Station booking and reservation
* Station session timer management
* Session extension and payment recording
* Snack ordering and order status workflow
* Payment Gateway Integration Sandbox
* Notifications for payments, orders, and reservations
* Announcements management
* User management and role assignment
* Tournament wins tracking
* Transaction history
* Profile management and image upload
* Public gaming API integration
* Email notification support
* Android mobile app for user features

---

## Objectives

ByteZone was developed with the following objectives:

1. Allow users to create an account, log in, view their personal dashboard/profile, and log out securely.
2. Protect pages and API routes so unauthorized users cannot access restricted content.
3. Implement role-based access for three roles: **User**, **Staff**, and **Admin**.
4. Provide station session timing where staff/admin can start, extend, and end station sessions.
5. Allow users to book stations based on reservation rules.
6. Allow users to order snacks while staff/admin manage order progress.
7. Record and track payments using a sandbox payment gateway flow.
8. Provide staff/admin management features such as announcements, users, orders, sessions, payments, and transaction history.
9. Integrate external services such as Google OAuth, SMTP email, Cloudinary file upload, and a public gaming API.
10. Provide an Android mobile app connected to the same deployed backend.

---

## User Roles

### User / Customer

Users can:

* Register and log in using email/password
* Log in using Google OAuth
* View personal dashboard insights
* View current active session and remaining time
* View reservation status
* Book a station
* Order snacks
* Complete sandbox payments
* View transaction history
* View notifications
* View announcements
* Update profile information
* Upload/change profile image

### Staff

Staff can:

* Access staff dashboard
* View operational metrics
* Manage station sessions
* Start sessions
* Extend sessions
* End sessions
* Manage reservations
* Manage snack orders
* Update order statuses
* Confirm payments
* Manage announcements
* View transaction history
* Update tournament wins

### Admin

Admin can do everything staff can do, plus:

* Manage users
* Change user roles
* Delete users
* Update user tournament wins
* Access full admin dashboard controls

---

## Major Features Implemented

### 1. Authentication and Authorization

Implemented features:

* User registration
* User login
* Logout
* JWT-based authentication
* BCrypt password hashing
* Protected API routes
* Protected frontend routes
* Current user endpoint
* Role-based access control
* User, Staff, and Admin role separation
* User-only restriction on Android mobile app

Supported authentication methods:

* Email and password login
* Google OAuth login
* Backend-issued JWT after Google verification

---

### 2. Google OAuth Login

Google login was implemented for both the web and Android mobile app.

Google OAuth flow:

1. User clicks Google login.
2. Google returns an ID token.
3. Frontend/mobile sends the ID token to the backend.
4. Backend verifies the Google ID token.
5. Backend creates or links the user account using email.
6. Backend returns ByteZone JWT.
7. The app stores the JWT and redirects the user based on role.

Backend endpoint:

```text
POST /api/auth/google
```

Request body:

```json
{
  "googleIdToken": "<GOOGLE_ID_TOKEN>"
}
```

Important Android Google setup:

* Android package name: `edu.cit.ursulo.bytezone`
* Android OAuth client created in Google Cloud Console
* Debug SHA-1 and SHA-256 configured
* Web Client ID used as `google_server_client_id`
* Render backend `GOOGLE_CLIENT_ID` uses the same Web Client ID

A setup guide is included in:

```text
mobile/GOOGLE_SIGN_IN_SETUP.md
```

---

### 3. Role-Based Access Control

Role-based access is enforced in both backend and UI.

Role behavior:

| Role  | Web Access                           | Mobile Access     |
| ----- | ------------------------------------ | ----------------- |
| User  | User dashboard and customer features | Allowed           |
| Staff | Staff dashboard and operations       | Blocked on mobile |
| Admin | Admin dashboard and full management  | Blocked on mobile |

The mobile app is intentionally limited to **User accounts only**. If a Staff or Admin account logs in on mobile, access is blocked and the user is directed to use the web admin dashboard.

---

### 4. User Dashboard

The user dashboard includes:

* First-name based status heading
* Total Hours Played
* Tournament Won
* Last Played
* Favorite Game
* Current active session
* Remaining time countdown
* Active station
* Reservation status
* Pending payments
* Announcements
* Notifications
* Quick actions
* Top Picks for Gamers from public API

The remaining session time was fixed to properly handle Philippine/Asia-Manila time and avoid incorrect 8-hour drift.

---

### 5. Staff/Admin Dashboard

The staff/admin dashboard includes operational metrics such as:

* Total users
* New users
* Active users
* Announcements count
* Transactions
* Pending payments
* Recent users
* Recent announcements
* Recent transactions

Staff and Admin users access a separate dashboard from normal users.

---

### 6. Station Session Timer Management

ByteZone acts as the station timer system.

Staff/Admin can:

* Start a session
* Assign user to station
* Assign station
* Set session duration
* Extend session time
* End active session

Session statuses include:

* ACTIVE
* ENDED

Station statuses include:

* AVAILABLE
* IN_USE
* RESERVED

When a session is started, the user dashboard displays:

* Remaining time
* Session status
* Station number

When the session is extended, the system updates the session end time and creates a payment/transaction record.

---

### 7. Station Booking and Reservation

Users can book computer stations using the booking module.

Implemented booking features:

* Station grid selection
* Available/unavailable/selected station states
* Date selection
* Time dropdown selection
* Duration selection
* Booking summary
* Sandbox checkout for reservation payment
* One booking per user per day rule
* Reservation status display on dashboard
* Staff/Admin reservation management

Reservation statuses:

* PENDING
* APPROVED
* CHECKED_IN
* COMPLETED
* CANCELLED
* EXPIRED

---

### 8. Snack Ordering

Users can browse and order snacks from the snack menu.

Implemented snack ordering features:

* Snack search
* Snack categories
* Horizontal carousel-style snack sections on mobile
* Snack images
* Price display
* Quantity controls
* Station selection
* Order summary
* Sandbox checkout
* User order history
* Staff/Admin order management

Order status flow:

```text
PENDING → PREPARING → READY → SERVED
```

Other possible status:

```text
CANCELLED
```

---

### 9. Payment Gateway Integration Sandbox

ByteZone uses a simulated payment gateway for project testing.

Implemented payment sandbox features:

* Sandbox checkout page
* Payment reference number
* Payment type
* Amount display
* Processing status
* QR-like sandbox display
* Pay Success button
* Fail Payment button
* Cancel button
* Payment status updates
* Payment records saved to database
* Payment notifications

Payment status flow:

```text
INITIATED → PROCESSING → PAID / FAILED / CANCELLED
```

Payment types include:

* RESERVATION
* SNACK_ORDER
* SESSION_EXTENSION

> This system does not process real money. The payment gateway is a sandbox simulation only.

---

### 10. Notifications

The notification module displays updates for:

* Reservation creation
* Payment updates
* Order updates
* Snack order status changes
* Session/payment reminders

Implemented notification features:

* Notification bell
* Unread count
* Notification list
* Mark notification as read
* Payment update messages
* Reservation update messages
* Order update messages

---

### 11. Announcements Management

Staff/Admin can manage announcements.

Implemented features:

* Create announcement
* Edit announcement
* Delete announcement
* View announcements
* Display announcements to users on dashboard/mobile

Announcements are shown to users as ByteZone updates.

---

### 12. User Management

Admin can manage users.

Implemented user management features:

* View users
* Edit users
* Delete users
* Change user role
* Update tournament wins
* Preserve user records when changing role back to User
* Role changes take effect on next login

Supported roles:

* USER
* STAFF
* ADMIN

---

### 13. Tournament Wins Tracking

Staff/Admin can update tournament wins for users.

The value appears on the user dashboard as:

```text
Tournament Won
```

---

### 14. Transaction History

Users and staff/admin can view transaction records.

Transaction history includes:

* Session extensions
* Snack orders
* Reservation payments
* Payment status
* Amount
* Reference number
* Date/time

---

### 15. File Upload and Profile Images

Implemented file/image upload features:

* Profile image upload
* Profile image update
* Profile image display
* File/image storage using Cloudinary
* File URL linked to user records

Cloudinary is used for image hosting and retrieval.

---

### 16. Email Sending via SMTP

SMTP email support was integrated in the backend.

Email configuration supports:

* SMTP host
* SMTP port
* SMTP username
* SMTP app password
* SMTP sender address

Email may be triggered for:

* Account-related messages
* Payment/notification-related messages
* Order-related notification events

---

### 17. Public Gaming API Integration

ByteZone integrates an external public games API for the dashboard gaming highlights/top picks.

Implemented feature:

* Top Picks for Gamers
* Public game data display
* Game title
* Game image/background
* Rating/release-related details depending on returned API data

External API:

```text
RAWG Video Games API
```

---

### 18. Android Mobile App

The Android mobile app was developed using Kotlin XML and Retrofit.

Mobile app scope:

* User-only mobile app
* No Staff/Admin mobile dashboard
* Same backend as web
* No mock data
* JWT-based authenticated API requests
* Render backend connection
* Google Sign-In support
* Email/password login
* User dashboard
* Booking
* Snack ordering
* Sandbox payment
* Transaction history
* Notifications
* Profile management
* Profile image upload
* Burger menu with Profile and Logout
* Bottom navigation for main user flows

Mobile screens:

* Login
* Register
* Home/Dashboard
* Book Station
* Order Snacks
* Transaction History
* Notifications
* Profile
* Sandbox Checkout

Mobile tech:

* Android Kotlin
* XML Layouts
* Retrofit
* OkHttp
* Gson Converter
* JWT token storage using SharedPreferences
* Google Sign-In
* API 34 target

---

## Tech Stack

### Backend

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| Java 17            | Backend language                 |
| Spring Boot        | Backend framework                |
| Spring Security    | Authentication and authorization |
| JWT                | Token-based authentication       |
| BCrypt             | Password hashing                 |
| Spring Data JPA    | Database access                  |
| Hibernate          | ORM                              |
| Maven              | Backend build tool               |
| PostgreSQL Driver  | Database connection              |
| Cloudinary SDK/API | Image/file storage               |
| JavaMail / SMTP    | Email sending                    |
| RAWG API           | Public gaming data integration   |

---

### Database

| Technology    | Purpose                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| PostgreSQL    | Main relational database                                                                                           |
| Supabase      | Hosted PostgreSQL database                                                                                         |
| JPA/Hibernate | Database mapping                                                                                                   |
| Relationships | User, station, reservation, session, snack, order, payment, announcement, notification, file/profile image records |

> Note: The original SDD listed MySQL as the database, but the final deployed implementation uses **Supabase PostgreSQL** for cloud deployment.

---

### Web Frontend

| Technology               | Purpose              |
| ------------------------ | -------------------- |
| ReactJS                  | Web UI               |
| Vite                     | Web build tool       |
| JavaScript / JSX         | Frontend development |
| CSS                      | ByteZone styling     |
| Axios / Fetch            | API communication    |
| Google Identity Services | Google OAuth login   |
| Vercel                   | Web deployment       |

---

### Mobile App

| Technology        | Purpose              |
| ----------------- | -------------------- |
| Android Kotlin    | Mobile app logic     |
| XML Layouts       | Android UI           |
| Retrofit          | API communication    |
| OkHttp            | HTTP client          |
| Gson Converter    | JSON parsing         |
| SharedPreferences | JWT/session storage  |
| Google Sign-In    | Android Google OAuth |
| Gradle            | Android build system |
| API Level 34      | Android target       |

---

### Deployment and Hosting

| Component           | Platform                  |
| ------------------- | ------------------------- |
| Web Frontend        | Vercel                    |
| Backend API         | Render                    |
| Database            | Supabase PostgreSQL       |
| Image/File Storage  | Cloudinary                |
| Mobile App          | Android APK               |
| External Public API | RAWG API                  |
| Email Service       | SMTP / Gmail App Password |

---

## Project Structure

```text
IT342-Ursulo-ByteZone/
│
├── backend/
│   ├── src/main/java/...
│   ├── src/main/resources/
│   ├── pom.xml
│   └── Dockerfile
│
├── web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── mobile/
│   ├── app/
│   │   ├── src/main/java/edu/cit/ursulo/bytezone/
│   │   ├── src/main/res/layout/
│   │   ├── src/main/res/drawable/
│   │   └── src/main/res/values/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── GOOGLE_SIGN_IN_SETUP.md
│
└── README.md
```

---

## Backend Environment Variables

The backend uses environment variables for security. Do not commit real secrets.

Required backend environment variables:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=
SERVER_PORT=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=

GOOGLE_CLIENT_ID=
RAWG_API_KEY=
```

Example notes:

* `DB_URL` points to the Supabase PostgreSQL JDBC connection string.
* `JWT_SECRET` is used to sign authentication tokens.
* `GOOGLE_CLIENT_ID` must be the Web Client ID used for Google token verification.
* `RAWG_API_KEY` is used for public gaming highlights.
* SMTP values are used for email sending.

---

## Web Frontend Environment Variables

Required Vercel/web environment variables:

```env
VITE_API_BASE_URL=https://bytezone-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=
```

Notes:

* `VITE_API_BASE_URL` connects the web app to the Render backend.
* `VITE_GOOGLE_CLIENT_ID` is the Google Web Client ID used by Google login.

---

## Mobile Configuration

Important mobile API config file:

```text
mobile/app/src/main/java/edu/cit/ursulo/bytezone/shared/api/ApiConfig.kt
```

The deployed backend should be:

```text
https://bytezone-backend.onrender.com/
```

The mobile app uses the deployed backend by default.

Google Sign-In configuration:

```text
mobile/app/src/main/res/values/strings.xml
```

The value of:

```xml
<string name="google_server_client_id">...</string>
```

must be the **Web Client ID**, not the Android Client ID.

Android OAuth requirements:

```text
Package name:
edu.cit.ursulo.bytezone

Debug SHA-1:
8C:1E:95:92:E4:4A:A7:E3:6C:77:7D:73:FB:EC:7B:9C:F4:1D:0A:D9

Debug SHA-256:
FB:58:34:3C:0F:1E:FA:64:2F:2A:C3:9B:E9:80:35:BE:65:65:02:AE:A8:EF:73:DB:96:8D:64:3C:C7:53:3F:33
```

Google Cloud Console must have:

* Web OAuth Client
* Android OAuth Client
* Package name: `edu.cit.ursulo.bytezone`
* SHA-1 fingerprint
* SHA-256 fingerprint
* Backend `GOOGLE_CLIENT_ID` matching the Web Client ID

---

## API Overview

Base URL:

```text
https://bytezone-backend.onrender.com
```

Common response format:

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

Authentication:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

### Authentication Endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/me
GET  /api/user/me
```

---

### Station and Session Endpoints

```text
GET  /api/stations
POST /api/sessions
GET  /api/sessions/me/active
PUT  /api/sessions/{id}/extend
PUT  /api/sessions/{id}/end
```

---

### Reservation Endpoints

```text
POST /api/reservations
GET  /api/reservations/me
GET  /api/reservations
PUT  /api/reservations/{id}
```

---

### Snack and Order Endpoints

```text
GET  /api/snacks
POST /api/orders
GET  /api/orders/me
GET  /api/orders
PUT  /api/orders/{id}/status
```

---

### Payment Endpoints

```text
POST /api/payments/initiate
POST /api/payments/sandbox/{id}/success
POST /api/payments/sandbox/{id}/fail
POST /api/payments/sandbox/{id}/cancel
GET  /api/payments/me
GET  /api/payments
GET  /api/payments/pending
PUT  /api/payments/{id}/confirm
```

---

### Notification Endpoints

```text
GET /api/notifications/me
GET /api/notifications/me/unread-count
PUT /api/notifications/{id}/read
```

---

### Admin/Staff Endpoints

```text
GET    /api/admin/metrics
GET    /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

---

### Announcement Endpoints

```text
GET    /api/announcements
POST   /api/announcements
PUT    /api/announcements/{id}
DELETE /api/announcements/{id}
```

---

### File/Profile Upload Endpoints

```text
POST /api/user/me/profile-image
PUT  /api/user/me
```

---

### Public API Integration

```text
GET /api/public/gaming-highlights
```

---

## Database Design Summary

The system uses a relational database structure with proper relationships between users, stations, sessions, reservations, orders, payments, files, and announcements.

Main tables/entities include:

1. `users`
2. `stations`
3. `sessions`
4. `reservations`
5. `snacks`
6. `orders`
7. `order_items`
8. `payments`
9. `announcements`
10. `notifications`
11. `files` / profile image records

Key relationships:

* One User has many Reservations.
* One User has many Orders.
* One User has many Payments.
* One User can have many Sessions.
* One Station can have many Sessions.
* One Station can have many Reservations.
* One Order has many Order Items.
* One Snack can appear in many Order Items.
* Payments can be linked to reservations, snack orders, or session extensions.
* Profile images/files are linked to user records.

---

## MoSCoW Feature Completion

### Must Have

| Requirement                                  | Status      |
| -------------------------------------------- | ----------- |
| Authentication                               | Implemented |
| Role-based access                            | Implemented |
| Core modules with CRUD and validation        | Implemented |
| User dashboard insights                      | Implemented |
| Admin/Staff dashboard metrics                | Implemented |
| Station timer/session management             | Implemented |
| Station booking/reservation                  | Implemented |
| Snack ordering and staff workflow            | Implemented |
| Notifications UI panel                       | Implemented |
| Announcements management                     | Implemented |
| User management and tournament wins          | Implemented |
| Transaction history                          | Implemented |
| External public API integration              | Implemented |
| Google OAuth login                           | Implemented |
| File/profile image upload                    | Implemented |
| SMTP email support                           | Implemented |
| Android Kotlin XML mobile app                | Implemented |
| Minimum 5 database tables with relationships | Implemented |
| Payment Gateway Integration Sandbox          | Implemented |

---

### Should Have

| Requirement                          | Status      |
| ------------------------------------ | ----------- |
| Search/filter stations               | Implemented |
| Search/filter snacks/orders          | Implemented |
| Order/session history for users      | Implemented |
| Clear validation messages            | Implemented |
| Responsive UI for desktop and mobile | Implemented |

---

### Could Have

| Requirement               | Status                                                           |
| ------------------------- | ---------------------------------------------------------------- |
| Basic dashboard analytics | Partially implemented through dashboard metrics                  |
| Real-time updates         | Implemented through refresh/polling-style updates, not WebSocket |

---

### Won’t Have

| Requirement              | Status       |
| ------------------------ | ------------ |
| Automatic PC lock/unlock | Not included |
| Advanced AI optimization | Not included |
| Multi-branch support     | Not included |

---

## How to Run the Project Locally

### Backend

Go to backend folder:

```bash
cd backend
```

Run using Maven:

```bash
./mvnw spring-boot:run
```

For Windows:

```bat
mvnw.cmd spring-boot:run
```

Build backend:

```bash
./mvnw clean package
```

For Windows:

```bat
mvnw.cmd clean package
```

---

### Web Frontend

Go to web folder:

```bash
cd web
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

---

### Android Mobile App

Go to mobile folder:

```bat
cd mobile
```

Build debug APK:

```bat
gradlew.bat clean assembleDebug --no-daemon --gradle-user-home "%TEMP%\bytezone-gradle-cache"
```

Generate signing report for Google OAuth:

```bat
gradlew.bat signingReport
```

Open the mobile project in Android Studio and run the app on an emulator or Android device.

---

## Deployment Summary

### Backend Deployment - Render

The backend is deployed as a Render Web Service.

Important Render setup:

* Runtime: Docker
* Service name: `bytezone-backend`
* Backend URL: `https://bytezone-backend.onrender.com`
* Environment variables configured in Render dashboard
* PostgreSQL connection uses Supabase
* Server listens on Render-provided port

---

### Web Deployment - Vercel

The web app is deployed on Vercel.

Important Vercel setup:

* Framework: Vite/React
* Root directory: `web`
* Build command: `npm run build`
* Output directory: `dist`
* Environment variables:

  * `VITE_API_BASE_URL`
  * `VITE_GOOGLE_CLIENT_ID`

Web URL:

```text
https://it-342-ursulo-byte-zone.vercel.app
```

---

### Database Deployment - Supabase

The database is hosted using Supabase PostgreSQL.

Supabase stores:

* Users
* Roles
* Stations
* Reservations
* Sessions
* Snack items
* Orders
* Payments
* Transactions
* Announcements
* Notifications
* Profile image/file links

---

### Mobile Deployment

The mobile app is built as an Android APK.

The mobile app connects to the same deployed backend:

```text
https://bytezone-backend.onrender.com/
```

---

## Security Features

Implemented security features:

* JWT authentication
* BCrypt password hashing
* Protected backend routes
* Protected frontend routes
* Role-based authorization
* No plaintext password storage
* DTOs do not expose password values
* Secrets stored in environment variables
* Authorization header redacted in mobile logs
* Google ID token verification handled by backend
* Android app blocks Staff/Admin users from mobile access

---

## Error Handling

The system handles common errors such as:

* Invalid credentials
* Duplicate email
* Unauthorized access
* Forbidden role access
* Reservation rule violation
* Station unavailable
* Empty snack order
* Payment not found
* Payment already confirmed
* Server errors
* Network/API connection errors

Mobile error handling was improved so that normal empty states do not show false backend connection errors.

---

## UI/UX Design Summary

The final system uses a ByteZone-themed dark interface with cyan/blue accents.

### Web UI

Web screens include:

* Landing page
* Login page
* Register page
* User dashboard
* Book station page
* Snack ordering page
* Transaction history
* Profile page
* Admin dashboard
* User management
* Announcements
* Extending time
* Snacks management
* Orders management
* Pending payments
* Staff/Admin transaction history

### Mobile UI

Mobile screens include:

* Login
* Register
* Dashboard
* Booking
* Snack ordering
* Sandbox checkout
* Notifications
* Transaction history
* Profile

Mobile UI improvements include:

* ByteZone dark/cyan theme
* Google button icons
* Station grid UI
* Booking status legends
* Carousel-style snack sections
* Burger menu with Profile and Logout
* Notification bell
* QR-like sandbox payment display
* Masked password fields
* User-only navigation

---

## Testing and Verification

The following were tested during development:

* Backend build
* Web build
* Mobile Gradle build
* Render backend deployment
* Vercel frontend deployment
* Supabase database connection
* User registration
* Email/password login
* Google login
* JWT-protected routes
* Role-based redirects
* Admin role changes
* User dashboard data
* Station booking
* Station session start
* Session extension
* Remaining time countdown
* Snack ordering
* Payment sandbox success/fail/cancel
* Transaction history
* Notifications
* Profile update
* Profile image upload
* Android mobile connection to deployed backend

Mobile build verification command:

```bat
gradlew.bat clean assembleDebug --no-daemon --gradle-user-home "%TEMP%\bytezone-gradle-cache"
```

---

## Important Notes

* The payment gateway is a sandbox simulation only and does not process real money.
* The Android mobile app is for User accounts only.
* Staff and Admin operations are handled through the web dashboard.
* Render Free Tier may cause backend cold starts.
* Google OAuth requires correct Google Cloud Console setup.
* Real secrets should never be committed to GitHub.
* Environment variables must be configured in Render and Vercel.
* The deployed implementation uses Supabase PostgreSQL instead of the originally planned MySQL database.

---

## Final Implementation Status

ByteZone has been completed as an integrated system with:

* Spring Boot backend
* React web frontend
* Android Kotlin mobile app
* Supabase PostgreSQL database
* Render backend deployment
* Vercel web deployment
* Google OAuth login
* JWT authentication
* Cloudinary image upload
* SMTP email support
* RAWG public API integration
* Payment Gateway Integration Sandbox
* Role-based User/Staff/Admin access
* Full station, reservation, snack, payment, notification, and transaction workflows

The final system follows the intended SDD scope while also including additional completed integrations and deployment improvements made during development.

---

## Developer

**Ursulo, Lichael Yashua E.**
BSIT - G1 
IT342 - System Integration and Architecture
Project: ByteZone

```
```
