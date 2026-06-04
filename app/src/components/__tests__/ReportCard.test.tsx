import React from 'react';
import renderer from 'react-test-renderer';
import {ReportCard} from '../ReportCard';
import type {Report} from '../../types';

const mockReport: Report = {
  id: '1',
  title: 'Bache en Av. 7a con Calle 45',
  description: 'Bache profundo de 30 cm que daña vehículos.',
  categoryId: 2,
  category: 'Vías',
  status: 'Pending',
  latitude: 4.624,
  longitude: -74.063,
  address: 'Av. 7a con Calle 45, Bogotá',
  createdById: 'u1',
  createdByName: 'Juan García',
  createdAt: '2026-01-15T10:00:00Z',
};

describe('ReportCard', () => {
  it('renders without image', () => {
    const tree = renderer.create(<ReportCard report={mockReport} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with thumbnail image', () => {
    const reportWithImage: Report = {
      ...mockReport,
      imageUrl: 'https://example.com/photo.jpg',
    };
    const tree = renderer
      .create(<ReportCard report={reportWithImage} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders Resolved status', () => {
    const resolved: Report = {...mockReport, status: 'Resolved'};
    const tree = renderer.create(<ReportCard report={resolved} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
