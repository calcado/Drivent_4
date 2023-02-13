import {Response} from "express"
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";
import { Booking } from "@prisma/client";

export async function getBooking(req:AuthenticatedRequest, res:Response){
    const {userId} = req;
    
    try{
        
        const booking = await bookingService.listBooking(userId)
        return res.status(httpStatus.OK).send(booking)

    }catch(error){
        // if(error.name==="NotFoundError"){
        //     return res.sendStatus(httpStatus.NOT_FOUND)
        // }
        
        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}

export async function postBooking(req:AuthenticatedRequest, res:Response){
    
    try{
    const {userId} = req;
    const {roomId} = req.body as Booking;
        
    const booking = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.OK).send({bookingId: booking.id})

    }catch(error){
        if(error.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }

        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}

export async function putBooking(req:AuthenticatedRequest, res:Response){
    const {userId} = req
    const {bookingId} = req.params; 
    const {roomId} = req.body as Booking
    
    try{   
       
        const updateBooking = await bookingService.updateBooking(userId, roomId,Number(bookingId))

        return res.status(httpStatus.OK).send({bookingId:updateBooking.id})

    }catch(error){

        if(error.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }

        return res.sendStatus(httpStatus.FORBIDDEN)
    }
}