import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBooking(userId:number){

    return prisma.booking.findFirst({
        where:{userId}
    })

} 

const bookingRepository = {
    findBooking,
}

export default bookingRepository;