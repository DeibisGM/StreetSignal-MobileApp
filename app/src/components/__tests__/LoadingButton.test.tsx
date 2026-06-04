import React from 'react';
import renderer from 'react-test-renderer';
import {LoadingButton} from '../LoadingButton';

describe('LoadingButton', () => {
  it('renders idle primary', () => {
    const tree = renderer
      .create(<LoadingButton label="Enviar" onPress={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders loading state', () => {
    const tree = renderer
      .create(<LoadingButton label="Enviando..." onPress={() => {}} loading />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const tree = renderer
      .create(<LoadingButton label="Enviar" onPress={() => {}} disabled />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders ghost variant', () => {
    const tree = renderer
      .create(<LoadingButton label="Cancelar" onPress={() => {}} variant="ghost" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
