import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBooking(userId:number){

    return prisma.booking.findFirst({
        where:{userId,},
        select:{
            id: true,
            Room: true
        }
    })

} 

async function createBooking(userId:number, roomId:number){
 return prisma.booking.create({
    data:{
        userId: userId,
        roomId: roomId,
    }
 })

}

async function findRoombyId(roomId:number){

    return prisma.room.findFirst({
        where:{id:roomId},
        include:{
            _count:{select:{Booking:true}}
        }
    })
}

async function updateBooking( bookingId:number, userId:number, roomId:number,){

    return prisma.booking.update({
        where:{id: bookingId},
        data:{
            userId:userId,
            roomId:roomId
        }
    })
}

const bookingRepository = {
    findBooking,
    createBooking,
    findRoombyId,
    updateBooking,
}

export default bookingRepository;