import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {CategoryPicker} from '../CategoryPicker';
import type {Category} from '../../types';

const categories: Category[] = [
  {id: '1', name: 'Vías', slug: 'vias', icon: 'Road', isActive: true},
  {id: '2', name: 'Alumbrado', slug: 'alumbrado', icon: 'Lightbulb', isActive: true},
  {id: '3', name: 'Acueducto', slug: 'acueducto', icon: 'Drop', isActive: true},
];

describe('CategoryPicker', () => {
  it('renders all categories unselected', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <CategoryPicker
            categories={categories}
            selectedId={null}
            onSelect={() => {}}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders with one category selected', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <CategoryPicker
            categories={categories}
            selectedId={'2'}
            onSelect={() => {}}
            label="Categoría"
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
