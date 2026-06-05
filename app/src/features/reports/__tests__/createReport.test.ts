import {reportsService} from '../../../api/reportsService';
import {apiClient} from '../../../api/client';

jest.mock('../../../api/client');

const mockedPost = apiClient.post as jest.Mock;

const REPORT_RESPONSE = {
  id: 'report-1',
  title: 'Bache en la acera',
  description: 'Hay un bache grande en la acera principal',
  categoryId: 'cat-guid-2',
  category: 'Infraestructura',
  status: 'Pending',
  latitude: 9.9281,
  longitude: -84.0907,
  address: 'San José, CR',
  createdById: 'user-1',
  createdByName: 'Ciudadano Test',
  createdAt: '2025-01-01T00:00:00Z',
};

describe('reportsService.createReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /reports with JSON body and all fields', async () => {
    mockedPost.mockResolvedValueOnce(REPORT_RESPONSE);

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
      address: 'San José, CR',
      imageUrl: 'https://example.com/photo.jpg',
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][0]).toBe('/reports');

    const body = mockedPost.mock.calls[0][1];
    expect(body.title).toBe('Bache en la acera');
    expect(body.description).toBe('Hay un bache grande en la acera principal');
    expect(body.categoryId).toBe('cat-guid-2');
    expect(body.latitude).toBe(9.9281);
    expect(body.longitude).toBe(-84.0907);
    expect(body.address).toBe('San José, CR');
    expect(body.imageUrl).toBe('https://example.com/photo.jpg');
  });

  it('omits optional fields when not provided', async () => {
    mockedPost.mockResolvedValueOnce(REPORT_RESPONSE);

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: null,
      longitude: null,
    });

    const body = mockedPost.mock.calls[0][1];
    expect(body.address).toBeNull();
    expect(body.imageUrl).toBeNull();
  });

  it('sends a JSON request (post, not postForm)', async () => {
    mockedPost.mockResolvedValueOnce(REPORT_RESPONSE);

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(apiClient.postForm).not.toHaveBeenCalled();
  });

  it('propagates API errors to the caller', async () => {
    const apiError = new Error('HTTP 400 Bad Request');
    mockedPost.mockRejectedValueOnce(apiError);

    await expect(
      reportsService.createReport({
        title: 'Bache en la acera',
        description: 'Hay un bache grande en la acera principal',
        categoryId: 'cat-guid-2',
        latitude: 9.9281,
        longitude: -84.0907,
      }),
    ).rejects.toThrow('HTTP 400 Bad Request');
  });

  it('returns the created report on success', async () => {
    mockedPost.mockResolvedValueOnce(REPORT_RESPONSE);

    const result = await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
    });

    expect(result.id).toBe('report-1');
    expect(result.status).toBe('Pending');
  });
});
