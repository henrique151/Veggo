import sequelize from "../database";
import Property from "../models/Property";
import Address from "../models/Address";
import { CreatePropertyInput } from "../schemas/propertiesSchema";
import City from "../models/City";
import { ExternalAddressService } from "./ExternalAddressService";
import User from "../models/User";
import PropertyUser from "../models/PropertyUser";
export class PropertyService {
    private static get defaultInclude() {
        return [
            {
                model: Address,
                as: 'address',
                attributes: { exclude: ["END_INT_ID", "CID_INT_ID"] },
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: { exclude: ["EST_INT_ID"] }
                    }
                ],

            }
        ];
    }

    static async createProperty(propertyData: CreatePropertyInput, userId: number) {
        const transaction = await sequelize.transaction();
        try {
            const externalData = await ExternalAddressService.getAddressByCep(propertyData.zipCode);
            if (!externalData) throw new Error('EXTERNAL_API_FAILURE');

            const city = await City.findByPk(externalData.cityIbgeCode);
            if (!city) throw new Error('CITY_NOT_FOUND');

            const address = await Address.create({
                street: externalData.street || propertyData.street,
                number: propertyData.number,
                complement: propertyData.complement,
                neighborhood: externalData.neighborhood || propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: externalData.cityIbgeCode
            }, { transaction });

            const property = await Property.create({
                ...propertyData,
                description: propertyData.description || '',
                addressId: address.id
            }, { transaction });

            // ← vincula o criador como DONO automaticamente
            await PropertyUser.create({
                userId,
                propertyId: property.id,
                role: 'DONO'
            }, { transaction });

            await transaction.commit();
            return this.getPropertyById(property.id);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getAllProperties() {
        return Property.findAll({
            attributes: { exclude: ["END_INT_ID"] },
            include: this.defaultInclude,
            order: [['END_INT_ID', 'ASC']]
        });
    }

    static async getPropertyById(id: number, userId?: number) {
        const property = await Property.findByPk(id, {
            attributes: { exclude: ['END_INT_ID'] },
            include: this.defaultInclude,
        });

        if (!property) throw new Error('PROPERTY_NOT_FOUND');

        if (userId) {
            const membership = await PropertyUser.findOne({
                where: { propertyId: id, userId }
            });
            if (!membership) throw new Error('PROPERTY_ACCESS_DENIED');
        }

        return property;
    }

    static async getMyProperties(userId: number) {
        return Property.findAll({
            attributes: { exclude: ['END_INT_ID'] },
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    where: { id: userId },
                    attributes: [],        // não retorna dados do user, só filtra
                    through: { attributes: [] }, // esconde a tabela pivô PropertyUser
                }
            ],
        });
    }
    static async deleteProperty(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            // Opção A: Soft Delete (Recomendado para manter histórico)
            // await property.update({ isActive: false });

            const addressId = property.addressId;
            await property.destroy({ transaction });
            await Address.destroy({ where: { id: addressId }, transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateProperty(id: number, propertyData: CreatePropertyInput) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            await property.update({
                ...propertyData
            }, { transaction })

            await Address.update({
                street: propertyData.street,
                number: propertyData.number,
                neighborhood: propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: propertyData.cityId
            }, {
                where: { id: property.addressId },
                transaction
            })

            await transaction.commit();
            return this.getPropertyById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

}