import { Category } from '../types';

export interface FlattenedCategory extends Category {
    level: number;
    displayName: string;
}

export const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0): FlattenedCategory[] => {
    const result: FlattenedCategory[] = [];

    // Encontra todas categorias cujo pai é o parentId atual (incluindo undefined/null)
    const children = categories.filter(c => {
        if (!parentId) return !c.parentId;
        return c.parentId === parentId;
    });

    // Ordena alfabeticamente para uma visualização melhor
    children.sort((a, b) => a.name.localeCompare(b.name));

    for (const child of children) {
        result.push({
            ...child,
            level,
            displayName: level === 0 ? child.name : `${'— '.repeat(level)}${child.name}`
        });

        // Busca os filhos dessa categoria recursivamente
        const nestedChildren = buildCategoryTree(categories, child.id, level + 1);
        result.push(...nestedChildren);
    }

    return result;
};
