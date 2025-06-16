import { and, not, or, sql, SQLWrapper } from 'drizzle-orm';
import { z } from 'zod';

export const Operators = {
  // Comparison Operators
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER: '>',
  GREATER_EQUALS: '>=',
  LESS: '<',
  LESS_EQUALS: '<=',

  // Text Operators
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  LIKE: 'like',
  ILIKE: 'ilike',

  // Null checks
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',

  // Lists
  IN: 'in',
  NOT_IN: 'not_in',

  // Ranges
  BETWEEN: 'between',
  NOT_BETWEEN: 'not_between',
} as const;

export type Operator = (typeof Operators)[keyof typeof Operators];

export type Combinator = 'and' | 'or';

export const OrderDirection = ['asc', 'desc'] as const;

export type FilterRule = {
  field: string;
  operator: Operator;
  value?: unknown;
};

export const FilterRuleSchema = z.object({
  field: z.string(),
  operator: z.nativeEnum(Operators),
  value: z.any(),
});

export type FilterRuleGroup = {
  combinator: Combinator;
  not?: boolean;
  rules: (FilterRule | FilterRuleGroup)[];
};

export const FilterRuleGroupSchema: z.ZodType<FilterRuleGroup> = z.lazy(() =>
  z.object({
    combinator: z.enum(['and', 'or']),
    not: z.boolean().optional(),
    rules: z.array(z.union([FilterRuleSchema, FilterRuleGroupSchema])),
  }),
);
