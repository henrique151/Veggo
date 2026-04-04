import axios from 'axios';

export class ExternalAddressService {
    static async getAddressByCep(cep: string) {
        // Remove traços ou espaços
        const cleanCep = cep.replace(/\D/g, '');

        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (data.erro) throw new Error('CEP_NOT_FOUND');

            return {
                street: data.logradouro,
                neighborhood: data.bairro,
                cityIbgeCode: Number(data.ibge),
                stateUf: data.uf
            };
        } catch (error) {
            throw new Error('EXTERNAL_API_FAILURE');
        }
    }
}