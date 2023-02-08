import { notFoundError,unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function listBooking(userId:number){

   const booking = await bookingRepository.findBooking(userId)
   return booking
}

const bookingService = {
    listBooking,
}

export default bookingService