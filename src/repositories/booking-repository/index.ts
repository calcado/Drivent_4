import { prisma } from "@/config";


async function findBooking(userId:number){

    return prisma.booking.findFirst({
        where:{userId,},
        select:{
            id: true,
            Room: true
        }
    })

} 

async function findBookingId(id:number){
    return prisma.booking.findFirst({
        where:{id},
    });
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

async function updateBooking( userId:number, roomId:number, bookingId:number,){

    return prisma.booking.update({
        where:{
            id: bookingId
        },
        data:{
            userId,
            roomId
        }
    })
}

const bookingRepository = {
    findBooking,
    findBookingId,
    createBooking,
    findRoombyId,
    updateBooking,
}

export default bookingRepository;