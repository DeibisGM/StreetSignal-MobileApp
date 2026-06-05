import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {EmptyState} from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and subtitle', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <EmptyState
            title="Sin reportes"
            subtitle="Aún no has creado ningún reporte."
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders with action button', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <EmptyState
            title="Sin reportes"
            actionLabel="Crear reporte"
            onAction={() => {}}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders custom icon', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<EmptyState icon="🔍" title="Sin resultados" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
