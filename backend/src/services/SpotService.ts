import sequelize from "../database";
import Spot from "../models/Spot";
import Property from "../models/Property";

export class SpotService {
    static async generateSpots(propId: number, spotData: any) {
        const transaction = await sequelize.transaction();
        try {
            const property = await Property.findByPk(propId, { transaction })
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const spots = [];
            for (let i = 1; i <= spotData.count; i++) {
                spots.push({
                    size: spotData.size,
                    status: 'INDISPONIVEL',
                    approvalStatus: 'PENDENTE',
                    identifier: `${spotData.prefix}${i}`,
                    allowedVehicles: spotData.allowedVehicles || ['CARRO'],
                    operatingHours: spotData.operatingHours || {},
                    isCovered: spotData.isCovered,
                    isActive: true,
                    propertyId: propId
                });
            }

            const createdSpots = await Spot.bulkCreate(spots, { transaction });
            await transaction.commit();
            return createdSpots;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async evaluateSpot(spotId: number, status: 'APROVADA' | 'RECUSADA' | 'SUSPENSA') {
        const spot = await Spot.findByPk(spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        const operationalStatus = status === 'APROVADA' ? 'DISPONIVEL' : 'INDISPONIVEL';

        await spot.update({
            approvalStatus: status as any,
            status: operationalStatus
        });
        return spot;
    }

    static async updateSpot(spotId: number, updateData: any) {
        const spot = await Spot.findByPk(spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        await spot.update(updateData);
        return spot;
    }

    static async getByProperty(propId: number) {
        return Spot.findAll({
            where: { propertyId: propId, isActive: true },
            attributes: { exclude: ['PRO_INT_ID'] },
            order: [['id', 'ASC']],
        });
    }
}
