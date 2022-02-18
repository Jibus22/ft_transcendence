import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class AppUtilsService {
  setNestedProperty(obj: Object, path: string, value: any) {
    const index = path.indexOf('.');
    if (index <= 0) {
      obj[path] = value;
      return;
    }
    return this.setNestedProperty(
      obj[path.slice(0, index)],
      path.slice(index + 1),
      value,
    );
  }

  getNestedProperty(obj: Object, path: string) {
    const index = path.indexOf('.');
    if (!obj[path]) {
      return undefined;
    }
    if (index <= 0) {
      return obj[path];
    }
    return this.getNestedProperty(
      obj[path.slice(0, index)],
      path.slice(index + 1),
    );
  }

  private makeRelationHierarchy(relation: string): string[] {
    let relationHierarchy: string[] = [];
    let tmpTree = relation.split('.');

    while (tmpTree.length) {
      relationHierarchy.push(
        tmpTree.reduce((prev, curr) => {
          return `${prev}.${curr}`;
        }),
      );
      tmpTree.pop();
    }
    return relationHierarchy;
  }

  private sortAndRemoveDuplicates(neededRelations: string[]) {
    const sortedAndDuplicateRemoved = new Set(neededRelations.sort());
    neededRelations.splice(0);
    sortedAndDuplicateRemoved.forEach((val) => neededRelations.push(val));
  }

  async fetchPossiblyMissingData<EntityType extends ObjectLiteral>(
    repo: Repository<EntityType>,
    entity: EntityType,
    allRelations: string[],
  ) {
    let neededRelations: string[] = [];
    allRelations.forEach((rel) => {
      if (!this.getNestedProperty(entity, rel)) {
        neededRelations.push(...this.makeRelationHierarchy(rel));
      }
    });

    if (neededRelations.length) {
      this.sortAndRemoveDuplicates(neededRelations);
      await repo
        .findOne(entity.id, { relations: neededRelations })
        .then((fullEntity) => {
          Object.assign(entity, fullEntity);
        });
    }
  }
}
