import { createBooking } from "../factories/booking-factory"
import app, { init } from "@/app";
import { cleanDb } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import { any } from "joi";

const api = supertest(app)



describe("GET /booking", ()=>{

    // it("Should respond with status 200 and booking body",async ()=>{
    // const booking = await createBooking()

    // const response = await api.get("/booking").send(booking)

    // expect(response.status).toBe(httpStatus.OK)
    // expect(response.body).toBe({
    //  roomId: booking.roomId   
    // })
    // })

})