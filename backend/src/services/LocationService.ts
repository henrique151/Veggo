import State from "../models/State";
import City from "../models/City";

export class LocationService {
    static async getStates() {
        return State.findAll({
            attributes: [['EST_INT_ID', 'id'], ['EST_STR_NOME', 'name'], ['EST_STR_UF', 'uf']],
            order: [['EST_INT_ID', 'ASC']]
        });
    }

    static async getCitiesByState(stateId: number) {
        return City.findAll({
            where: { stateId },
            attributes: [['CID_INT_ID', 'id'], ['CID_STR_NOME', 'name']],
            order: [['CID_STR_NOME', 'ASC']],
        });
    }
}