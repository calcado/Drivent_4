import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';


async function checckEnrollmentAndTicket(userId:number){

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
  if(!enrollment){
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket){
    throw forbiddenError();
  }

  if(ticket.status==="RESERVED" ||  !ticket.TicketType.includesHotel || ticket.TicketType.isRemote){
    throw forbiddenError();
  }

}

async function listBooking(userId: number) {
  await checckEnrollmentAndTicket(userId);

  const booking = await bookingRepository.findBooking(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

async function createBooking(userId: number, roomId: number) {
  await checckEnrollmentAndTicket(userId);

  const room = await bookingRepository.findRoombyId(roomId);
  if (!room) {
    throw notFoundError();
  }
  if (room.capacity <= room._count.Booking) {
    throw forbiddenError();
  }
  
  const alreadyBooked = await bookingRepository.findBooking(userId)
  if(alreadyBooked){
    throw forbiddenError();
  }

  const newBooking = await bookingRepository.createBooking(userId, roomId);
  await checckEnrollmentAndTicket(userId);

  if (!newBooking) {
    throw notFoundError();
  }
  

  return newBooking;
}

export async function updateBooking(userId: number, roomId: number, bookingId: number, ) {
  
  await checckEnrollmentAndTicket(userId);
  
  const booking  = await bookingRepository.findBookingId(bookingId)

  if(!booking || booking.userId !== userId || booking.roomId === roomId){
    throw forbiddenError();
  }
  

  const room = await bookingRepository.findRoombyId(roomId);
  if (!room) {
    throw notFoundError();
  }
  

  if (room.capacity <= room._count.Booking) {
    throw forbiddenError();
  }

  const update = await bookingRepository.updateBooking(userId, roomId, bookingId);

  return update;
}

const bookingService = {
  listBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
