import joi from 'joi';
export default{
   validateBody(body){
        const Schema = joi.object().keys({
            name: joi.string().required(),
            songs: joi.array().required().items()
        });
        const { error ,value } = joi.validate(body,Schema);
        if(error && error.details)
        return {error}
        return {value}
    }
}