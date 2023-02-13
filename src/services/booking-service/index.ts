import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import { number } from 'joi';

async function listBooking(userId: number) {
  const booking = await bookingRepository.findBooking(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const room = await bookingRepository.findRoombyId(roomId);
  if (!room) {
    throw notFoundError();
  }
  if (room.capacity <= room._count.Booking) {
    throw forbiddenError();
  }

  const newBooking = await bookingRepository.createBooking(userId, roomId);

  if (!newBooking) {
    throw notFoundError();
  }
  if (!roomId) {
    throw notFoundError();
  }

  return newBooking;
}

export async function updateBooking(bookingId: number, userId: number, roomId: number) {
  const room = await bookingRepository.findRoombyId(roomId);
  if (!room) {
    throw notFoundError();
  }

  if (room.capacity <= room._count.Booking) {
    throw forbiddenError();
  }


  const update = await bookingRepository.updateBooking(userId, roomId, bookingId);

  if (!update) {
    throw notFoundError();
  }

  return update;
}

const bookingService = {
  listBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
