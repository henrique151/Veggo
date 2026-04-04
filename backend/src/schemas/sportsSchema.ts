import { z } from 'zod';

const RULES = {
    COUNT_MIN: 1,
    SIZE_MIN: 1,
    PREFIX_MAX: 10,
    IDENTIFIER_MAX: 70
} as const;


const allowedVehiclesSchema = z.array(
    z.enum(['CARRO', 'MOTO'], {
        error: 'Tipo de veículo inválido. Use: CARRO ou MOTO'
    })
).min(1, 'A vaga deve permitir pelo menos um tipo de veículo');

const hoursSchema = z.record(
    z.string(),
    z.object({
        start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inicial inválida (HH:MM)'),
        end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora final inválida (HH:MM)')
    })
).optional();

const countSchema = z
    .number({ message: 'A quantidade deve ser um número' })
    .int()
    .min(RULES.COUNT_MIN, { message: `É necessário gerar ao menos ${RULES.COUNT_MIN} vaga` });

const sizeSchema = z
    .number({ error: 'O tamanho deve ser um número' })
    .positive('O tamanho da vaga deve ser maior que zero')
    .optional()
    .default(12.5);

const prefixSchema = z
    .string()
    .max(RULES.PREFIX_MAX, `O prefixo não pode exceder ${RULES.PREFIX_MAX} caracteres`)
    .optional()
    .default('VAGA-');

export const generateSpotsSchema = z.object({
    count: countSchema.default(1),
    size: sizeSchema,
    isCovered: z.boolean().optional().default(true),
    prefix: prefixSchema,
    allowedVehicles: allowedVehiclesSchema,
    operatingHours: hoursSchema
}).strict();

export const updateSpotStatusSchema = z.object({
    status: z.enum(['DISPONIVEL', 'INDISPONIVEL', 'OCUPADA'], {
        error: 'Status inválido. Use: DISPONIVEL, INDISPONIVEL ou OCUPADA'
    })
}).strict();

export const evaluateSpotSchema = z.object({
    approvalStatus: z.enum(['APROVADA', 'RECUSADA', 'SUSPENSA'], {
        error: 'Status de aprovação inválido'
    }),
    rejectionReason: z.string().max(255, 'Motivo muito longo').optional()
}).strict();

export const spotParamsSchema = z.object({
    propId: z.string().regex(/^\d+$/, 'ID da propriedade inválido'),
});

export const spotIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID da vaga inválido'),
});

export type GenerateSpotsInput = z.infer<typeof generateSpotsSchema>;