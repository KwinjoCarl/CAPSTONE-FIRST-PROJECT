import { Card, Col, Row, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useState } from 'react';
import { getProducts, getCustomers, getSuppliers, getSales, getPurchases } from '@/services/api';

const APITestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runTest = async (name, apiCall) => {
    try {
      const startTime = Date.now();
      const response = await apiCall();
      const endTime = Date.now();
      
      return {
        name,
        status: 'success',
        message: `✅ Success - ${response.data.length} records found`,
        time: `${endTime - startTime}ms`,
        data: response.data.slice(0, 3) // Show first 3 records
      };
    } catch (error) {
      return {
        name,
        status: 'error',
        message: `❌ Error: ${error.message}`,
        time: '-',
        data: null
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      { name: 'Products API', call: getProducts },
      { name: 'Customers API', call: getCustomers },
      { name: 'Suppliers API', call: getSuppliers },
      { name: 'Sales API', call: getSales },
      { name: 'Purchases API', call: getPurchases }
    ];

    const results = [];
    for (const test of tests) {
      const result = await runTest(test.name, test.call);
      results.push(result);
      setTestResults([...results]);
    }

    setTesting(false);
  };

  const getStatusBadge = (status) => {
    return status === 'success' ? (
      <Badge bg="success">✅ Connected</Badge>
    ) : (
      <Badge bg="danger">❌ Failed</Badge>
    );
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">API Connection Test</h4>
            <p className="text-muted">Test your connection to the MySQL backend</p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={runAllTests}
                  disabled={testing}
                >
                  {testing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Testing...
                    </>
                  ) : (
                    <>
                      <i className="mdi mdi-play-circle me-2"></i>
                      Run API Tests
                    </>
                  )}
                </Button>
              </div>

              {testResults.length > 0 && (
                <>
                  <Alert variant="info">
                    <strong>Backend URL:</strong> http://localhost:5000/api
                  </Alert>

                  <Table striped bordered hover>
                    <thead className="table-light">
                      <tr>
                        <th>API Endpoint</th>
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result, index) => (
                        <tr key={index}>
                          <td><strong>{result.name}</strong></td>
                          <td>{getStatusBadge(result.status)}</td>
                          <td>{result.time}</td>
                          <td>{result.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {testResults.every(r => r.status === 'success') ? (
                    <Alert variant="success">
                      <h5>🎉 All Tests Passed!</h5>
                      <p className="mb-0">
                        Your React frontend is successfully connected to the MySQL backend.
                        You can now start using the API in your components.
                      </p>
                    </Alert>
                  ) : (
                    <Alert variant="danger">
                      <h5>⚠️ Some Tests Failed</h5>
                      <p className="mb-2">Please check:</p>
                      <ul className="mb-0">
                        <li>Backend server is running on port 5000</li>
                        <li>MySQL database is connected</li>
                        <li>Database tables exist</li>
                        <li>CORS is enabled in backend</li>
                      </ul>
                    </Alert>
                  )}

                  {testResults.some(r => r.data && r.data.length > 0) && (
                    <div className="mt-4">
                      <h5>Sample Data Preview:</h5>
                      {testResults.map((result, index) => (
                        result.data && result.data.length > 0 && (
                          <Card key={index} className="mb-3">
                            <Card.Header>
                              <strong>{result.name}</strong> - First 3 records
                            </Card.Header>
                            <Card.Body>
                              <pre className="mb-0" style={{ maxHeight: '200px', overflow: 'auto' }}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </Card.Body>
                          </Card>
                        )
                      ))}
                    </div>
                  )}
                </>
              )}

              {testResults.length === 0 && !testing && (
                <Alert variant="info">
                  <h5>Ready to Test</h5>
                  <p className="mb-0">
                    Click the "Run API Tests" button above to verify your connection to the backend.
                  </p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Troubleshooting</h5>
            </Card.Header>
            <Card.Body>
              <h6>If tests fail, try these steps:</h6>
              <ol>
                <li>
                  <strong>Check Backend Server:</strong>
                  <pre className="bg-light p-2 mt-2">
                    cd C:\DEV\Websites\BMS3\backend{'\n'}
                    npm start
                  </pre>
                </li>
                <li>
                  <strong>Verify Backend URL:</strong>
                  <p>Open <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer">http://localhost:5000</a> in your browser</p>
                </li>
                <li>
                  <strong>Check Database Connection:</strong>
                  <pre className="bg-light p-2 mt-2">
                    cd C:\DEV\Websites\BMS3\backend{'\n'}
                    node test-connection.js
                  </pre>
                </li>
                <li>
                  <strong>Check Browser Console:</strong>
                  <p>Press F12 and look for error messages in the Console tab</p>
                </li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default APITestPage;
