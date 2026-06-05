import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {AppTextInput} from '../AppTextInput';

describe('AppTextInput', () => {
  it('renders with label and placeholder', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<AppTextInput label="Email" placeholder="Ingresa tu email" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders error state', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<AppTextInput label="Email" error="Correo inválido" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders helper text', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<AppTextInput label="Código" helperText="6 dígitos" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<AppTextInput label="Nombre" editable={false} value="Solo lectura" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
