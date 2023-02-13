import { authenticateToken, validateBody } from "@/middlewares";
import {Router} from "express"
import { getBooking, postBooking,putBooking } from "@/controllers/booking-controller";
import { bookingSchema } from "@/schemas/booking-schema";
const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .get("/", getBooking )
    .post("/",validateBody(bookingSchema) ,postBooking)
    .put("/:bookingId",putBooking )

export {bookingRouter}

//.post("/", postBooking)
//.put("/bookingId", updateBooking)