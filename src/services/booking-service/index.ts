import { notFoundError} from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function listBooking(userId:number){

   const booking = await bookingRepository.findBooking(userId)
   
   if(!booking){
    throw notFoundError
   }
   
   return booking
}

async function createBooking(userId:number){

    const newBooking = await bookingRepository.createBooking(userId)
    

    return newBooking

}

const bookingService = {
    listBooking,
    createBooking,
}

export default bookingService