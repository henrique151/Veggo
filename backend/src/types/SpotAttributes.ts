export interface SpotAttributes {
    id: number;
    size: number;
    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA';
    identifier: string;
    approvalStatus: 'PENDENTE' | 'APROVADA' | 'RECUSADA';
    allowedVehicles: string;
    operatingHours: string;
    isCovered: boolean;
    isActive: boolean;
    propertyId: number;
}
