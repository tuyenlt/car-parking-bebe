import { Injectable } from "@nestjs/common";
import {
  Brackets,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SaveOptions,
} from "typeorm";
import { castArray } from "lodash";
import { BaseEntity } from "src/entities/base-entity";
import { CONDITION_FILTER_ENUM, QUERY_OPERATOR_ENUM } from "src/common/constants/query.constant";
import { ORDER_DIRECTION } from "src/common/constants/common.constant";
import { randomAlphabet } from "src/common/utils/common.util";
import { escapeRegExp } from "typeorm/util/escapeRegExp.js";
/**
 * Base repository class for projects.
 */
@Injectable()
export abstract class BaseCrudRepository<E extends BaseEntity>
{
  constructor(
    private readonly repository: Repository<E>,
    private readonly alias: string,
  ) {}

  createQueryBuilder(alias?: string) {
	return this.repository.createQueryBuilder(alias || this.alias);
  }

  async create(data, queryRunner?: QueryRunner, options: SaveOptions = {}) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.repository.target)
        .save(data, { ...options });
    }
    return await this.repository.save(data, { ...options });
  }

  async update(id: string | number, data, queryRunner?: QueryRunner) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.alias)
        .update(id, data);
    }
    return await this.repository.update(id, data);
  }

  async updateBy(where: FindOptionsWhere<E>, data, queryRunner?: QueryRunner) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.repository.target)
        .update(where, data);
    }
    return await this.repository.update(where, data);
  }

  async upsert(data, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(this.repository.target)
      : this.repository;
    const newData = repo.create(data);
    return await repo.save(newData);
  }

  async findByFilter(
    filter: any,
    select?: { [key: string]: boolean },
    relations?: string[],
    order: { [key: string]: "ASC" | "DESC" } = { id: "ASC" },
  ) {
    return await this.repository.find({
      where: filter,
      select: select as any,
      relations: relations,
      order: order as FindOptionsOrder<E>,
    });
  }

  async findByFilterWithDeleted(
    filter: any,
    select?: { [key: string]: boolean },
    relations?: string[],
    order: { [key: string]: "ASC" | "DESC" } = { id: "ASC" },
  ) {
    return await this.repository.find({
      where: filter,
      select: select as any,
      relations: relations,
      order: order as FindOptionsOrder<E>,
      withDeleted: true,
    });
  }

  async findOneByFilter(
    filter: any,
    select?: { [key: string]: boolean },
    relations?: string[],
    order?: FindOptionsOrder<E>,
    withDeleted?: boolean,
  ) {
    return await this.repository.findOne({
      where: filter,
      select: select as any,
      relations: relations,
      order,
      withDeleted: withDeleted || false,
    });
  }

  async getListsWithGetRawMany(
    query,
    callbackQuery: (queryBuilder) => any,
    callbackSelectData: (data) => any,
  ) {
    const limit = +query?.per_page || 10;
    const page = +query?.page || 1;
    const queryBuilder = this.repository.createQueryBuilder(this.alias);
    const [dataLists, total] = await Promise.all([
      callbackQuery(queryBuilder)
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      dataList: callbackSelectData(dataLists),
    };
  }

  async getListsWithGetMany(
    query,
    callbackQuery: (queryBuilder) => any,
    callbackSelectData: (data) => any,
  ) {
    const limit = +query?.per_page || 10;
    const page = +query?.page || 1;
    const queryBuilder = this.repository.createQueryBuilder(this.alias);
    const [dataLists, total] = await Promise.all([
      callbackQuery(queryBuilder)
        .offset((page - 1) * limit)
        .limit(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      dataList: callbackSelectData(dataLists),
    };
  }

  async getListsWithRawQuery(
    query,
    callbackQuery: (queryBuilder) => any,
    callbackSelectData: (data) => any,
    option?: {
      dataBinding?: string[];
    },
  ) {
    const queryBuilder = this.repository.createQueryBuilder(this.alias);
    const sqlQuery = callbackQuery(queryBuilder);
    const totalCountQuery = `
          SELECT COUNT(*) AS total_count
          FROM (
            ${sqlQuery.getSql()}
          ) AS subquery
        `;
    const [dataLists, totals] = await Promise.all([
      this.repository.query(
        sqlQuery
          .offset((query?.page - 1) * query?.per_page)
          .limit(query?.per_page)
          .getSql(),
        option?.dataBinding,
      ),
      this.repository.query(totalCountQuery, option?.dataBinding),
    ]);

    const total = +totals[0].total_count;
    return {
      total,
      totalPages: Math.ceil(total / query?.per_page),
      currentPage: query?.page,
      limit: query?.per_page,
      dataList: callbackSelectData(dataLists),
    };
  }

  async delete(id: number | string, queryRunner?: QueryRunner) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.repository.target)
        .softDelete(id);
    }
    return await this.repository.softDelete(id);
  }

  async bulkDelete(ids: number[], queryRunner?: QueryRunner) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.repository.target)
        .softDelete(ids);
    }
    return await this.repository.softDelete(ids);
  }

  async deleteBy(where: FindOptionsWhere<E>, queryRunner?: QueryRunner) {
    return await this.repository
      .createQueryBuilder(this.alias, queryRunner)
      .softDelete()
      .where(where)
      .execute();
  }

  async hardDeleteBy(where: FindOptionsWhere<E>, queryRunner?: QueryRunner) {
    return await this.repository
      .createQueryBuilder(this.alias, queryRunner)
      .delete()
      .where(where)
      .execute();
  }

  async getOneByFilter(
    callbackQuery: (queryBuilder) => any,
    callbackSelectData: (data) => any,
  ) {
    const queryBuilder = this.repository.createQueryBuilder(this.alias);
    const [data] = await Promise.all([callbackQuery(queryBuilder).getOne()]);
    if (!data) {
      return null;
    }

    return {
      record: callbackSelectData(data),
    };
  }

  async exists(
    filter: FindOptionsWhere<E> | FindOptionsWhere<E>[],
    includeSoftDeleted: boolean = false,
  ): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder(this.alias);

    if (includeSoftDeleted) {
      queryBuilder.withDeleted();
    }

    queryBuilder.where(filter);

    return await queryBuilder.getExists();
  }

  async hardDelete(id: number | number[], queryRunner?: QueryRunner) {
    if (queryRunner) {
      return await queryRunner.manager
        .getRepository(this.repository.target)
        .delete(id);
    }
    return await this.repository.delete(id);
  }

  /**
   * build query builder
   **/
  setSearch(queryBuilder, searchFields: string[], keyword: string) {
    queryBuilder.where(
      new Brackets((qb) => {
        searchFields.forEach((key) =>
          qb.orWhere(`${key} ~* :keyword`, { keyword: escapeRegExp(keyword) }),
        );
      }),
    );
    return queryBuilder;
  }

  /* Sort
   */
  setSort(queryBuilder, sort: { [key: string]: ORDER_DIRECTION }) {
    Object.entries(sort).forEach(([key, value]) =>
      queryBuilder.addOrderBy(`${key}`, value),
    );
    return queryBuilder;
  }

  /* Filter
   */
  setFilter(
    queryBuilder,
    filter: {
      [key: string]: {
        value: any;
        operator: QUERY_OPERATOR_ENUM;
      };
    },
    conditionFilter: "AND" | "OR" = "AND",
  ) {
    if (filter) {
      Object.entries(filter).forEach((item) =>
        this._processFilter(queryBuilder, item, conditionFilter),
      );
    }
    return queryBuilder;
  }

  private _processFilter(
    queryBuilder,
    [filterKey, filterValues]: [
      string,
      {
        value: any;
        operator: QUERY_OPERATOR_ENUM;
      },
    ],
    conditionFilter,
  ) {
    const { sqlRaw, queryParams } = this._processFilterByOperator(
      filterValues.operator,
      filterKey,
      filterValues.value,
    );
    if (conditionFilter === CONDITION_FILTER_ENUM.AND)
      sqlRaw && queryBuilder.andWhere(sqlRaw, queryParams);
    else sqlRaw && queryBuilder.orWhere(sqlRaw, queryParams);
    return queryBuilder;
  }

  private _processFilterByOperator(
    operator: QUERY_OPERATOR_ENUM,
    key: string,
    filterValues: string,
  ) {
    let sqlRaw: string;
    let queryParams: ObjectLiteral;
    const randomKeyVariableBinding: string = randomAlphabet(10) + Date.now();

    if (operator === QUERY_OPERATOR_ENUM.IN) {
      sqlRaw = `${key} IN (:...${randomKeyVariableBinding})`;
      queryParams = { [randomKeyVariableBinding]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = "");
      return { sqlRaw, queryParams };
    }

    if (operator === QUERY_OPERATOR_ENUM.NOT_IN) {
      sqlRaw = `${key} NOT IN (:...${randomKeyVariableBinding})`;
      queryParams = { [randomKeyVariableBinding]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = "");
      return { sqlRaw, queryParams };
    }

    if (operator === QUERY_OPERATOR_ENUM.GTE) {
      sqlRaw = `${key} >= :${randomKeyVariableBinding}`;
      queryParams = { [randomKeyVariableBinding]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (operator === QUERY_OPERATOR_ENUM.LTE) {
      sqlRaw = `${key} <= :${randomKeyVariableBinding}`;
      queryParams = { [randomKeyVariableBinding]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (operator === QUERY_OPERATOR_ENUM.GT) {
      sqlRaw = `${key} > :${randomKeyVariableBinding}`;
      queryParams = { [randomKeyVariableBinding]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (operator === QUERY_OPERATOR_ENUM.LT) {
      sqlRaw = `${key} < :${randomKeyVariableBinding}`;
      queryParams = { [randomKeyVariableBinding]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (operator === QUERY_OPERATOR_ENUM.LIKE) {
      sqlRaw = `${key} LIKE :${key}`;
      queryParams = { [key]: `%${filterValues}%` };
      return { sqlRaw, queryParams };
    }

    sqlRaw = `${key} = :${randomKeyVariableBinding}`;
    queryParams = { [randomKeyVariableBinding]: filterValues };
    return { sqlRaw, queryParams };
  }
}
