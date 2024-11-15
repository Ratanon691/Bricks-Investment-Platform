# Bricks - Real Estate Fractional Investment Platform

## Description
Bricks is a web application that enables fractional ownership of real estate properties. The platform allows users to invest in high-value properties by purchasing shares, making real estate investment more accessible to small investors.

## Features
- User authentication and authorization
- Property listing and details view
- Fractional property investment
- Buy and sell property shares
- User portfolio management
- Admin panel for property management
- Transaction history tracking

## Tech Stack
- Frontend:
  - React.js
  - React Router for navigation
  - Axios for API requests
  - Tailwind CSS for styling
  - Lucide React for icons

- Backend:
  - Node.js
  - Express.js
  - MySQL with Sequelize ORM
  - JWT for authentication
  - Multer for file uploads

## Prerequisites
- Node.js (v14 or higher)
- MySQL
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/bricks.git
cd bricks
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

4. Configure Environment Variables
Create a `.env` file in the backend directory with the following:
```
JWT_SECRET=your_jwt_secret
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
```

5. Initialize Database
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

6. Create Admin User
```bash
node scripts/createAdmin.js
```

## Running the Application

1. Start Backend Server
```bash
cd backend
npm start
```

2. Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)