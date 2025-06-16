import { and, not, or, sql, SQLWrapper } from 'drizzle-orm';
import {
  FilterRule,
  FilterRuleGroup,
  Operators,
} from '../interfaces/IDatabaseFilterBuilder';

export class FilterBuilder {
  static build(filter: FilterRuleGroup): SQLWrapper {
    return this.processRuleGroup(filter);
  }

  static raw(query: SQLWrapper) {
    return query.getSQL();
  }

  private static processRuleGroup(group: FilterRuleGroup): SQLWrapper {
    const conditions = group.rules.map((rule) =>
      this.isRuleGroup(rule)
        ? this.processRuleGroup(rule)
        : this.processRule(rule),
    );

    if (conditions.length === 0) {
      return sql`1=1`;
    }

    const result = (
      group.combinator === 'and' ? and(...conditions) : or(...conditions)
    ) as SQLWrapper;

    return group.not ? not(result) : result;
  }

  private static processRule(rule: FilterRule): SQLWrapper {
    const column = sql.identifier(rule.field);

    switch (rule.operator) {
      case Operators.EQUALS:
        return sql`${column} = ${rule.value}`;

      case Operators.NOT_EQUALS:
        return sql`${column} != ${rule.value}`;

      case Operators.GREATER:
        return sql`${column} > ${rule.value}`;

      case Operators.GREATER_EQUALS:
        return sql`${column} >= ${rule.value}`;

      case Operators.LESS:
        return sql`${column} < ${rule.value}`;

      case Operators.LESS_EQUALS:
        return sql`${column} <= ${rule.value}`;

      case Operators.CONTAINS:
        return sql`${column} ILIKE %${rule.value}%`;

      case Operators.NOT_CONTAINS:
        return sql`${column} NOT ILIKE %${rule.value}%`;

      case Operators.STARTS_WITH:
        return sql`${column} ILIKE ${rule.value}%`;

      case Operators.ENDS_WITH:
        return sql`${column} ILIKE %${rule.value}`;

      case Operators.LIKE:
        return sql`${column} LIKE ${rule.value}`;

      case Operators.ILIKE:
        return sql`${column} ILIKE ${rule.value}`;

      case Operators.IS_NULL:
        return sql`${column} IS NULL`;

      case Operators.IS_NOT_NULL:
        return sql`${column} IS NOT NULL`;

      case Operators.IN:
        if (!Array.isArray(rule.value)) {
          return sql`${column} = ANY(${rule.value})`;
        }
        return sql`${column} = ANY(ARRAY[${sql.join(rule.value)}])`;

      case Operators.NOT_IN:
        if (!Array.isArray(rule.value)) {
          return sql`${column} != ANY(${rule.value})`;
        }
        return sql`${column} != ANY(ARRAY[${sql.join(rule.value)}])`;

      case Operators.BETWEEN:
        if (!Array.isArray(rule.value) || rule.value.length !== 2) {
          throw new Error('Between operator requires two values');
        }
        return sql`${column} BETWEEN ${rule.value[0]} AND ${rule.value[1]}`;

      case Operators.NOT_BETWEEN:
        if (!Array.isArray(rule.value) || rule.value.length !== 2) {
          throw new Error('Between operator requires two values');
        }
        return sql`${column} NOT BETWEEN ${rule.value[0]} AND ${rule.value[1]}`;

      default:
        throw new Error(`Unknown operator: ${rule.operator}`);
    }
  }

  private static isRuleGroup(
    rule: FilterRule | FilterRuleGroup,
  ): rule is FilterRuleGroup {
    return 'rules' in rule;
  }
}

/**
 * ===== FilterBuilder =====
 * Builds a SQLWrapper from a filter rule group
 *
 * @example
 * const filter = {
 *   combinator: 'and',
 *   rules: [
 *     { field: 'name', operator: '=', value: 'John' },
 *     { field: 'age', operator: '>', value: 25 },
 *     {
 *       combinator: 'or',
 *       rules: [
 *         { field: 'city', operator: '=', value: 'New York' },
 *         { field: 'city', operator: '=', value: 'Los Angeles' }
 *       ],
 *        not: false,
 *     }
 *   ],
 * };
 * const sql = FilterBuilder.build(filter);
 * Generates: (name = 'John' AND age > 25 AND (city = 'New York' OR city = 'Los Angeles'))
 */
