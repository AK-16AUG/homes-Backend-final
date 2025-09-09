import express, { Request, Response } from 'express';
import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';
import dbConnect from './db/db.connect.js';
import authRouter from './routes/Auth.routes.js';
import propertyRouter from './routes/Property.routes.js';
// import { authSwaggerDefinitions } from './Schema/auth.swagger.js';
// import { propertySwaggerDefinitions } from './Schema/property.swagger.js';
import router from './routes/Amenties&service.route.js';
// import { serviceAmenitiesSwaggerDefinitions } from './Schema/amenties&services.swaggger.js';
import appointmentRouter from './routes/Appointment.routes.js';
// import { appointmentSwaggerDefinitions } from './Schema/appointment.swagger.js';
import dotenv from "dotenv";
import userRouter from './routes/User.routes.js';
import { sendOtpEmail } from './common/services/email.js';
import asyncHandler from './utils/asyncHandler.js';
  import User from './entities/User.entitiy.js';
//   import { tenantSwaggerDefinitions } from './Schema/tenant.swagger.js';
import tenantRouter from './routes/Tenant.routes.js';
// import { notificationSwaggerDefinitions } from './Schema/Notification.swagger.js';
import notificationRouter from './routes/Notification.routes.js';
import leadsRouter from './routes/Leads.routes.js';
import ResetPassModel from './entities/ResetPass.entitiy.js';
import morgan from 'morgan';
import targetRouter from './routes/Target.routes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dashboardRouter from './routes/Dashboard.routes.js';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(helmet());
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 400, // limit each IP to 400 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(dashboardRouter);

const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Combine all Swagger definitions
// const combinedSwaggerDefinitions = {
//   components: {
//     schemas: {
//       ...authSwaggerDefinitions.User,
//       ...propertySwaggerDefinitions.Property,
//       ...serviceAmenitiesSwaggerDefinitions.components.schemas.Amenties,
//       ...appointmentSwaggerDefinitions.components.schemas.Appointment,
//       ...tenantSwaggerDefinitions.components.schemas.Tenant,
//       ...notificationSwaggerDefinitions.components.schemas.Notification
//     },
//     securitySchemes: {
//       bearerAuth: {
//         type: "http",
//         scheme: "bearer",
//         bearerFormat: "JWT"
//       }
//     }
//   },
//   paths: {
//     ...authSwaggerDefinitions.paths,
//     ...propertySwaggerDefinitions.paths,
//     ...serviceAmenitiesSwaggerDefinitions.paths,
//     ...appointmentSwaggerDefinitions.paths,
//     ...tenantSwaggerDefinitions.paths,
//     ...notificationSwaggerDefinitions.paths
//   }
// };

// Swagger setup
/*
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate API',
      version: '1.0.0',
      description: 'API documentation for Real Estate project',
    },
    servers: [
      { url: `http://localhost:${PORT}` }
    ],
    ...combinedSwaggerDefinitions
  },
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
*/

app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running with ES Modules!');
});


app.use("/api/auth", authRouter);
app.use("/api/property", propertyRouter); 
app.use("/api/amentiesservice", router); 
app.use("/api/appointments", appointmentRouter);
app.use("/api/user", userRouter);
app.use("/api/tenant", tenantRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/leads", leadsRouter);
app.use("/api", targetRouter);
app.use("/api", dashboardRouter);


app.post("/api/sendemail",asyncHandler( async (req: Request, res: Response) => {
  const { email } = req.body;
  User.deleteOne({email})
  try {
    
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
User.create({email,otp});
    
    await sendOtpEmail(email, otp);

    return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully" 
    });

  } catch (error: any) {
    User.deleteOne({email})
    console.error("Error sending email:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP email" 
    });
  }
}));
app.post("/api/resetsendemail",asyncHandler( async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
ResetPassModel.create({email,otp});
    
    await sendOtpEmail(email, otp);

    return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully" 
    });

  } catch (error: any) {
    User.deleteOne({email})
    console.error("Error sending email:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP email" 
    });
  }
}));
dbConnect().then(() => {
     app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
   console.log(`Swagger docs at http://0.0.0.0:${PORT}/api/docs`);
});

}).catch((error: Error) => {
  console.error("Database connection failed", error);
});

export default app;