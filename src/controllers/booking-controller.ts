import {Response} from "express"
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";
import { Booking } from "@prisma/client";
import { notFoundError } from "@/errors";

export async function getBooking(req:AuthenticatedRequest, res:Response){
    const {userId} = req;
    
    try{
        
        const booking = await bookingService.listBooking(userId)
        return res.status(httpStatus.OK).send(booking)
    }catch(error){
        if(error.name==="NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }
      
        
        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}

export async function postBooking(req:AuthenticatedRequest, res:Response){
    //Apenas usuários com ticket presencial, com hospedagem e pago podem fazer reservas.

    try{
    const {userId} = req;
    const {roomId} = req.body as Booking;
    
    if(!roomId){
        throw notFoundError;
    }
    
    await bookingService.createBooking(userId, roomId);

      return res.sendStatus(200)
      
    }catch(error){
        if(error.name === "ConflictError"){
            return res.sendStatus(httpStatus.CONFLICT)
        }

        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}