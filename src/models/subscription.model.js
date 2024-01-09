import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,    // the one is suscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId,    // the one is being suscribed
            ref: "User"
        },
    }
    , {timestamps: true})

export const Subscription = mongoose.model('Subscription', subscriptionSchema)