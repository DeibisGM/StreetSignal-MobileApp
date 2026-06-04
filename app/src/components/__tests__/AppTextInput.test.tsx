import React from 'react';
import renderer from 'react-test-renderer';
import {AppTextInput} from '../AppTextInput';

describe('AppTextInput', () => {
  it('renders with label and placeholder', () => {
    const tree = renderer
      .create(<AppTextInput label="Email" placeholder="Ingresa tu email" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders error state', () => {
    const tree = renderer
      .create(<AppTextInput label="Email" error="Correo inválido" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders helper text', () => {
    const tree = renderer
      .create(<AppTextInput label="Código" helperText="6 dígitos" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const tree = renderer
      .create(<AppTextInput label="Nombre" editable={false} value="Solo lectura" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
