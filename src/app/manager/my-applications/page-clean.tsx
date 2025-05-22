                {/* Import Interface based on method */}
                <div className="mt-4">
                  {importMethod === 'paste' && (
                    <div>
                      <Textarea 
                        id="bulk-data"
                        placeholder="Paste data from Excel or CSV here..."
                        className="h-60 font-mono bg-white w-full"
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {importMethod === 'file' && (
                    <div className="space-y-2">
                      <Label>Upload your file</Label>
                      <div 
                        {...getRootProps()} 
                        className="border-2 border-dashed rounded-md p-10 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center bg-white"
                      >
                        <input {...getInputProps()} />
                        <UploadCloud className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Drag & drop a CSV or Excel file here, or click to select
                        </p>
                        {uploadedFile && (
                          <div className="mt-2 bg-blue-50 rounded p-2 text-sm">
                            Selected: {uploadedFile.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-2">
                        <a 
                          href="#" 
                          className="text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            const sampleData = "client_name,proposed_insured_name,carrier,product,monthly_premium,status,paid_status\nJohn Doe,John Doe,Fidelity,Term Life,85.50,Approved,Paid\nJane Smith,Jane Smith,Mutual of Omaha,Final Expense,65.25,In Process,Pending";
                            const blob = new Blob([sampleData], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'applications_template.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          Download sample template
                        </a>
                      </div>
                    </div>
                  )}
                </div> 