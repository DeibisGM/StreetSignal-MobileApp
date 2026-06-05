import React from 'react';
import renderer from 'react-test-renderer';
import {CategoryPicker} from '../CategoryPicker';
import type {Category} from '../../types';

const categories: Category[] = [
  {id: '1', name: 'Vías', slug: 'vias', icon: '🛣️', isActive: true},
  {id: '2', name: 'Alumbrado', slug: 'alumbrado', icon: '💡', isActive: true},
  {id: '3', name: 'Acueducto', slug: 'acueducto', icon: '💧', isActive: true},
];

describe('CategoryPicker', () => {
  it('renders all categories unselected', () => {
    const tree = renderer
      .create(
        <CategoryPicker
          categories={categories}
          selectedId={null}
          onSelect={() => {}}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with one category selected', () => {
    const tree = renderer
      .create(
        <CategoryPicker
          categories={categories}
          selectedId={'2'}
          onSelect={() => {}}
          label="Categoría"
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
