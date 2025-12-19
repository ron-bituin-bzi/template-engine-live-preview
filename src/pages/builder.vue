<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Question Set Builder</h1>
        <p class="text-body-1 mb-6">Create insurance product questions and generate configuration files</p>
      </v-col>
    </v-row>

    <!-- Question Form -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6">Add New Question</div>
            <v-btn
              icon="mdi-upload"
              variant="text"
              size="small"
              @click.stop="openUploadDialog"
            />
          </div>
          
          <v-form ref="questionForm">
            <v-text-field
              v-model="newQuestion.jsonPath"
              label="Field Name (JSON Path)"
              hint="e.g., InsuredName, ABN, BusinessTradingName"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.questionLabel"
              label="Question Label"
              hint="Displayed as the question text"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.controlLabel"
              label="Control Label"
              hint="Label for the input field"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <div class="mb-3">
              <label class="text-subtitle-2 mb-2 d-block">Input Type</label>
              <v-radio-group v-model="newQuestion.inputType">
                <v-row dense>
                  <v-col
                    v-for="type in inputTypes"
                    :key="type"
                    cols="4"
                  >
                    <v-radio
                      :value="type"
                      density="compact"
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center gap-2">
                          <v-icon size="small">
                            {{
                              {
                                'text': 'mdi-form-textbox',
                                'typeahead': 'mdi-card-search-outline',
                                'number': 'mdi-numeric',
                                'decimal': 'mdi-decimal',
                                'dropdown': 'mdi-form-select',
                                'address': 'mdi-map-marker',
                                'radio': 'mdi-radiobox-marked',
                                'date': 'mdi-calendar-range',
                                'table': 'mdi-table',
                                'hidden': 'mdi-eye-off',
                                'textarea': 'mdi-form-textarea',
                                'checkbox': 'mdi-checkbox-marked'
                              }[type] || 'mdi-help-circle-outline'
                            }}
                          </v-icon>
                          <span>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-col>
                </v-row>
              </v-radio-group>
            </div>

            <v-text-field
              v-model="newQuestion.section"
              label="Section"
              hint="e.g., BusinessDetails, UnderwritingCriteria"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-autocomplete
              v-model="newQuestion.dependentOn"
              :items="availableParentQuestions"
              item-title="label"
              item-value="value"
              label="Dependent On (Parent Question)"
              hint="Select if this is a sub-question"
              persistent-hint
              density="comfortable"
              clearable
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.documentTitle"
              label="Document Title"
              hint="Title shown in document output"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <div class="mb-4">
              <label class="text-subtitle-2 mb-2 d-block">Document Visibility</label>
              <v-row dense>
                <v-col cols="4">
                  <v-checkbox
                    v-model="newQuestion.docVisible"
                    label="SCD"
                    value="SCD"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="4">
                  <v-checkbox
                    v-model="newQuestion.docVisible"
                    label="PRP"
                    value="PRP"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="4">
                  <v-checkbox
                    v-model="newQuestion.docVisible"
                    label="COC"
                    value="COC"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>

            <div class="d-flex">
              <v-btn
                color="primary"
                @click="addQuestion"
                size="large"
                class="mr-3"
              >
                {{ editingIndex !== null ? 'Update Question' : 'Add Question' }}
              </v-btn>
              <v-btn
                v-if="editingIndex !== null"
                color="error"
                @click="cancelEdit"
                size="large"
              >
                Cancel
              </v-btn>
            </div>
          </v-form>

          <!-- Live Form Preview -->
          <v-divider class="my-6" />
          <div class="text-h6 mb-4">Live Preview</div>
          <div class="form-preview-container">
            <div class="preview-question-row">
              <label class="preview-label">
                {{ newQuestion.questionLabel || 'Question Label' }}
                <span class="required">*</span>
              </label>
              
              <div class="preview-input-container">
                <!-- Text Input -->
                <input
                  v-if="newQuestion.inputType === 'text'"
                  type="text"
                  class="preview-input"
                  :placeholder="''"
                />
                
                <!-- Number Input -->
                <input
                  v-else-if="newQuestion.inputType === 'number'"
                  type="number"
                  class="preview-input"
                  placeholder=""
                />

                <!-- Decimal Input -->
                <input
                  v-else-if="newQuestion.inputType === 'decimal'"
                  type="number"
                  step="0.01"
                  class="preview-input"
                  placeholder=""
                />
                
                <!-- Dropdown -->
                <select
                  v-else-if="newQuestion.inputType === 'dropdown'"
                  class="preview-input"
                >
                  <option value="">Select an option...</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                </select>

                <!-- Address -->
                <input
                  v-else-if="newQuestion.inputType === 'address'"
                  type="text"
                  class="preview-input"
                  placeholder=""
                />
                
                <!-- Radio Buttons -->
                <div v-else-if="newQuestion.inputType === 'radio'" class="preview-radio-buttons">
                  <button type="button" class="radio-button">YES</button>
                  <button type="button" class="radio-button">NO</button>
                </div>
                
                <!-- Checkbox -->
                <div v-else-if="newQuestion.inputType === 'checkbox'" class="preview-checkbox-group">
                  <label class="preview-checkbox-item">
                    <input type="checkbox" />
                    <span>Option 1</span>
                  </label>
                  <label class="preview-checkbox-item">
                    <input type="checkbox" />
                    <span>Option 2</span>
                  </label>
                </div>
                
                <!-- Date -->
                <input
                  v-else-if="newQuestion.inputType === 'date'"
                  type="date"
                  class="preview-input"
                />
                
                <!-- Textarea -->
                <textarea
                  v-else-if="newQuestion.inputType === 'textarea'"
                  class="preview-input preview-textarea"
                  rows="3"
                  :placeholder="''"
                ></textarea>

                <!-- Typeahead -->
                <input
                  v-else-if="newQuestion.inputType === 'typeahead'"
                  type="text"
                  class="preview-input"
                  placeholder="Start typing to search..."
                />

                <!-- Table -->
                <div v-else-if="newQuestion.inputType === 'table'" class="preview-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                        <th>Column 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><input type="text" class="table-input" /></td>
                        <td><input type="text" class="table-input" /></td>
                        <td><input type="text" class="table-input" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Hidden -->
                <div v-else-if="newQuestion.inputType === 'hidden'" class="hidden-preview">
                  <em>Hidden field (not visible to user)</em>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Questions List -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4 questions-card">
          <v-card-title class="text-h6 pa-0 mb-4">
            Questions ({{ questions.length }})
          </v-card-title>

          <v-tabs v-if="questions.length > 0" v-model="selectedSectionTab" class="mb-3">
            <v-tab
              v-for="section in uniqueSections"
              :key="section"
              :value="section"
            >
              {{ section }} ({{ getQuestionsBySection(section).length }})
            </v-tab>
          </v-tabs>

          <v-window v-if="questions.length > 0" v-model="selectedSectionTab">
            <v-window-item
              v-for="section in uniqueSections"
              :key="section"
              :value="section"
            >
              <v-list class="mb-4 questions-list">
                <v-list-item
                  v-for="(question, index) in getQuestionsBySection(section)"
                  :key="index"
                  class="px-0 question-list-item"
                  :class="{ 'question-editing': editingIndex === question.originalIndex }"
                  @click="selectQuestion(question.originalIndex)"
                  style="cursor: pointer;"
                >
              <template v-slot:prepend>
                <v-icon :color="editingIndex === index ? 'error' : 'default'">
                  {{
                    editingIndex === index ? 'mdi-pencil' : (
                      {
                        'text': 'mdi-form-textbox',
                        'typeahead': 'mdi-card-search-outline',
                        'number': 'mdi-numeric',
                        'decimal': 'mdi-decimal',
                        'dropdown': 'mdi-form-select',
                        'address': 'mdi-map-marker',
                        'radio': 'mdi-radiobox-marked',
                        'date': 'mdi-calendar-range',
                        'table': 'mdi-table',
                        'hidden': 'mdi-eye-off',
                        'textarea': 'mdi-form-textarea',
                        'checkbox': 'mdi-checkbox-marked'
                      }[question.inputType] || 'mdi-help-circle-outline'
                    )
                  }}
                </v-icon>
              </template>
              <v-list-item-title>{{ question.questionLabel }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ question.jsonPath }} • {{ question.inputType }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click.stop="removeQuestion(question.originalIndex)"
                />
              </template>
                </v-list-item>
              </v-list>
            </v-window-item>
          </v-window>

          <v-alert v-else type="info" variant="tonal">
            No questions added yet. Add your first question using the form.
          </v-alert>

          <v-divider class="my-4" />

          <div class="d-flex flex-wrap">
            <v-btn
              color="success"
              :disabled="questions.length === 0"
              @click="downloadQuestionsJson"
              prepend-icon="mdi-download"
              class="mr-3 mb-2"
            >
              Download questions.json
            </v-btn>
            <v-btn
              color="success"
              :disabled="questions.length === 0"
              @click="downloadMappingJson"
              prepend-icon="mdi-download"
              class="mb-2"
            >
              Download mapping.json
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Preview Section -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h6 pa-0 mb-4">JSON Preview</v-card-title>
          
          <v-tabs v-model="previewTab" class="mb-4">
            <v-tab value="questions">questions.json</v-tab>
            <v-tab value="mapping">mapping.json</v-tab>
          </v-tabs>

          <v-window v-model="previewTab">
            <v-window-item value="questions">
              <pre class="code-preview">{{ JSON.stringify(generateQuestionsJson(), null, 2) }}</pre>
            </v-window-item>
            <v-window-item value="mapping">
              <pre class="code-preview">{{ JSON.stringify(generateMappingJson(), null, 2) }}</pre>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6">Import Questions from JSON</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="questionsFile"
            label="Upload questions.json"
            accept=".json"
            prepend-icon="mdi-file-code"
            class="mb-4"
            @click:clear="questionsFile = null"
          />
          <v-file-input
            v-model="mappingFile"
            label="Upload mapping.json"
            accept=".json"
            prepend-icon="mdi-file-code"
            @click:clear="mappingFile = null"
          />
          <v-alert v-if="uploadError" type="error" class="mt-4">
            {{ uploadError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="uploadDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="importJsonFiles"
            :disabled="!questionsFile || !mappingFile"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const inputTypes = ['text', 'number', 'decimal', 'dropdown', 'address', 'radio', 'checkbox', 'date', 'textarea', 'typeahead', 'table', 'hidden']

  const newQuestion = ref({
    jsonPath: '',
    questionLabel: '',
    controlLabel: '',
    inputType: 'text',
    section: 'BusinessDetails',
    documentTitle: '',
    docVisible: [],
    dependentOn: null
  })

  const questions = ref([])
  const mappingData = ref(null)
  const previewTab = ref('questions')
  const editingIndex = ref(null)
  const uploadDialog = ref(false)
  const questionsFile = ref(null)
  const mappingFile = ref(null)
  const uploadError = ref('')
  const selectedSectionTab = ref('BusinessDetails')

  const availableParentQuestions = computed(() => {
    return [
      { label: '(None - Top Level)', value: null },
      ...questions.value.map((q, index) => ({
        label: `${q.questionLabel} (${q.jsonPath})`,
        value: q.jsonPath
      }))
    ]
  })

  const uniqueSections = computed(() => {
    // If mapping data exists, use sections from mapping to preserve order
    if (mappingData.value?.Mapping) {
      const mappingSections = mappingData.value.Mapping.map(m => m.Section)
      return mappingSections.length > 0 ? mappingSections : ['BusinessDetails']
    }
    // Otherwise, get unique sections from questions
    const sections = [...new Set(questions.value.map(q => q.section))]
    return sections.length > 0 ? sections : ['BusinessDetails']
  })

  const getQuestionsBySection = (section) => {
    return questions.value
      .map((q, index) => ({ ...q, originalIndex: index }))
      .filter(q => q.section === section)
  }

  const openUploadDialog = () => {
    console.log('Opening upload dialog')
    uploadError.value = ''
    questionsFile.value = null
    mappingFile.value = null
    uploadDialog.value = true
  }

  onMounted(() => {
    // Open upload dialog if coming from "Edit Existing Questions"
    if (route.query.mode === 'edit') {
      uploadDialog.value = true
    }

    // Listen for debug toggle
    window.addEventListener('debug-toggle', (e) => {
      if (e.detail) {
        loadSampleQuestions()
      } else {
        questions.value = []
        mappingData.value = null
        resetForm()
      }
    })
  })

  const loadSampleQuestions = async () => {
    try {
      // Dynamically import the sample JSON files
      const questionsData = await import('@/assets/sample_product/questions.json')
      const loadedMapping = await import('@/assets/sample_product/mapping.json')
      
      // Store mapping data
      mappingData.value = loadedMapping.default

      const importedQuestions = []
      
      // Recursive function to extract all questions including dependent questions
      // and build parent-child dependency map
      const extractQuestions = (questions, section, parentQuestion = null) => {
        questions.forEach(q => {
          questionSectionMap[q.Question] = section
          // Track parent-child relationship
          if (parentQuestion) {
            questionDependencyMap[q.Question] = parentQuestion
          }
          // Recursively process dependent questions
          if (q.DependentQuestion && q.DependentQuestion.length > 0) {
            extractQuestions(q.DependentQuestion, section, q.Question)
          }
        })
      }
      
      // Create maps for question to section and question to parent
      const questionSectionMap = {}
      const questionDependencyMap = {}
      loadedMapping.default.Mapping?.forEach(sectionObj => {
        extractQuestions(sectionObj.Questions || [], sectionObj.Section)
      })
      
      // Parse questions.json
      Object.keys(questionsData.default).forEach(key => {
        const q = questionsData.default[key]
        importedQuestions.push({
          jsonPath: q.JsonPath,
          questionLabel: q.QuestionLabel,
          controlLabel: q.ControlLabel,
          inputType: q.InputType,
          section: questionSectionMap[key] || 'BusinessDetails',
          documentTitle: q.Document?.DocumentTitle || q.QuestionLabel,
          docVisible: q.Document?.DocVisible || [],
          dependentOn: questionDependencyMap[key] || null
        })
      })
      
      questions.value = importedQuestions
      console.log('Debug mode: Loaded sample questions')
    } catch (error) {
      console.error('Failed to load sample questions:', error)
      uploadError.value = `Failed to load sample questions: ${error.message}`
    }
  }

  const addQuestion = () => {
    if (!newQuestion.value.jsonPath || !newQuestion.value.questionLabel) {
      return
    }

    if (editingIndex.value !== null) {
      // Update existing question
      questions.value[editingIndex.value] = { ...newQuestion.value }
      editingIndex.value = null
    } else {
      // Add new question
      questions.value.push({ ...newQuestion.value })
    }

    // Reset form
    resetForm()
  }

  const selectQuestion = (index) => {
    editingIndex.value = index
    newQuestion.value = { ...questions.value[index] }
  }

  const cancelEdit = () => {
    editingIndex.value = null
    resetForm()
  }

  const resetForm = () => {
    newQuestion.value = {
      jsonPath: '',
      questionLabel: '',
      controlLabel: '',
      inputType: 'text',
      section: 'BusinessDetails',
      documentTitle: '',
      docVisible: [],
      dependentOn: null
    }
  }

  const removeQuestion = (index) => {
    if (editingIndex.value === index) {
      cancelEdit()
    } else if (editingIndex.value !== null && editingIndex.value > index) {
      editingIndex.value--
    }
    questions.value.splice(index, 1)
  }

  const generateQuestionsJson = () => {
    const questionsObj = {}
    
    questions.value.forEach(q => {
      questionsObj[q.jsonPath] = {
        JsonPath: q.jsonPath,
        QuestionLabel: q.questionLabel,
        Document: {
          DocVisible: q.docVisible && q.docVisible.length > 0 ? q.docVisible : ["SCD", "PRP", "COC"],
          DocOrder: Object.keys(questionsObj).length + 1,
          DocumentTitle: q.documentTitle || q.questionLabel
        },
        ControlLabel: q.controlLabel || q.questionLabel,
        InputType: q.inputType,
        DefaultValue: "",
        AvailableValue: "",
        Prerequisite: "",
        PrerequisiteJoiner: "",
        AdditionalProperties: [],
        DataSource: "",
        Validation: [],
        HintText: null,
        HelpText: null,
        ResponseXPath: `$.Response.${q.section}.${q.jsonPath}`,
        DataType: "",
        DataTypePath: "",
        ArrayTitle: ""
      }
    })

    return questionsObj
  }

  const generateMappingJson = () => {
    const sectionMap = {}
    const sectionOrder = mappingData.value?.Mapping?.map(m => m.Section) || []
    
    // Group questions by section
    questions.value.forEach(q => {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = []
      }
      sectionMap[q.section].push({
        Question: q.jsonPath,
        DependentQuestion: []
      })
    })

    // Convert to mapping array, preserving section order from mapping if available
    const allSections = [...new Set([...sectionOrder, ...Object.keys(sectionMap)])]
    const mapping = allSections
      .filter(section => sectionMap[section]) // Only include sections with questions
      .map(section => ({
        Section: section,
        Questions: sectionMap[section],
        DependentSection: []
      }))

    return { Mapping: mapping }
  }

  const downloadQuestionsJson = () => {
    const data = JSON.stringify(generateQuestionsJson(), null, 2)
    downloadFile(data, 'questions.json')
  }

  const downloadMappingJson = () => {
    const data = JSON.stringify(generateMappingJson(), null, 2)
    downloadFile(data, 'mapping.json')
  }


  const importJsonFiles = async () => {
    uploadError.value = ''
    
    try {
      if (!questionsFile.value || !mappingFile.value) {
        uploadError.value = 'Please select both files'
        return
      }

      // Get the file objects (v-file-input returns array)
      const qFile = Array.isArray(questionsFile.value) ? questionsFile.value[0] : questionsFile.value
      const mFile = Array.isArray(mappingFile.value) ? mappingFile.value[0] : mappingFile.value
      
      // Read questions.json
      const questionsText = await qFile.text()
      const questionsData = JSON.parse(questionsText)
      
      // Read mapping.json
      const mappingText = await mFile.text()
      const loadedMapping = JSON.parse(mappingText)
      
      // Store mapping data
      mappingData.value = loadedMapping
      
      // Parse and populate questions
      const importedQuestions = []
      
      // Recursive function to extract all questions including dependent questions
      // and build parent-child dependency map
      const extractQuestions = (questions, section, parentQuestion = null) => {
        questions.forEach(q => {
          questionSectionMap[q.Question] = section
          // Track parent-child relationship
          if (parentQuestion) {
            questionDependencyMap[q.Question] = parentQuestion
          }
          // Recursively process dependent questions
          if (q.DependentQuestion && q.DependentQuestion.length > 0) {
            extractQuestions(q.DependentQuestion, section, q.Question)
          }
        })
      }
      
      // Create maps for question to section and question to parent
      const questionSectionMap = {}
      const questionDependencyMap = {}
      loadedMapping.Mapping?.forEach(sectionObj => {
        extractQuestions(sectionObj.Questions || [], sectionObj.Section)
      })
      
      // Parse questions.json
      Object.keys(questionsData).forEach(key => {
        const q = questionsData[key]
        importedQuestions.push({
          jsonPath: q.JsonPath,
          questionLabel: q.QuestionLabel,
          controlLabel: q.ControlLabel,
          inputType: q.InputType,
          section: questionSectionMap[key] || 'BusinessDetails',
          documentTitle: q.Document?.DocumentTitle || q.QuestionLabel,
          docVisible: q.Document?.DocVisible || [],
          dependentOn: questionDependencyMap[key] || null
        })
      })
      
      questions.value = importedQuestions
      uploadDialog.value = false
      questionsFile.value = null
      mappingFile.value = null
      
    } catch (error) {
      uploadError.value = `Error parsing JSON files: ${error.message}`
      console.error('Import error:', error)
    }
  }
  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
</script>

<style scoped>
  .code-preview {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 500px;
    font-size: 12px;
    line-height: 1.5;
  }

  :deep(.v-theme--dark) .code-preview {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .questions-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .questions-list {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    overflow-x: visible;
    padding: 4px;
  }

  .question-list-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 4px;
    transform-origin: center;
  }

  .question-list-item:hover {
    transform: scale(1.05);
    z-index: 1;
    width: calc(100% - 4%);
    margin-left: 2%;
  }

  .question-editing {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background-color: rgba(233, 30, 99, 0.08) !important;
    border: 2px solid #e91e63;
    /* border: 2px solid #e91e63; */
    z-index: 10;
    width: calc(100% - 4%);
    margin-left: 2%;
  }

  :deep(.v-theme--dark) .question-editing {
    background-color: rgba(233, 30, 99, 0.15) !important;
    box-shadow: 0 6px 16px rgba(233, 30, 99, 0.3);
  }

  .question-editing:hover {
    transform: scale(1.02) translateY(-2px);
  }

  .form-preview-container {
    padding: 24px;
    background-color: white;
    border: 2px solid #e91e63;
    border-radius: 8px;
    min-height: 120px;
  }

  :deep(.v-theme--dark) .form-preview-container {
    background-color: #1e1e1e;
  }

  .preview-question-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
    align-items: center;
  }

  .preview-label {
    font-size: 14px;
    font-weight: 400;
    text-align: right;
    padding-right: 16px;
  }

  .required {
    color: #e91e63;
    font-weight: bold;
    margin-left: 4px;
  }

  .preview-input-container {
    display: flex;
    align-items: center;
  }

  .preview-input {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
  }

  :deep(.v-theme--dark) .preview-input {
    background-color: #2d2d2d;
    border-color: #555;
  }

  .preview-input:focus {
    outline: none;
    border-color: #666;
  }

  .preview-textarea {
    resize: vertical;
  }

  .preview-radio-buttons {
    display: flex;
    gap: 0;
  }

  .radio-button {
    padding: 8px 32px;
    border: 1px solid #ccc;
    background-color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .radio-button:first-child {
    border-radius: 4px 0 0 4px;
  }

  .radio-button:last-child {
    border-radius: 0 4px 4px 0;
    border-left: none;
  }

  .radio-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .radio-button:active,
  .radio-button.active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  :deep(.v-theme--dark) .radio-button {
    background-color: #2d2d2d;
    border-color: #555;
  }

  :deep(.v-theme--dark) .radio-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .preview-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
  }

  .preview-checkbox-item input[type="checkbox"] {
    cursor: pointer;
  }

  .preview-table {
    width: 100%;
  }

  .preview-table table {
    width: 100%;
    border-collapse: collapse;
  }

  .preview-table th,
  .preview-table td {
    padding: 8px;
    border: 1px solid #ccc;
    text-align: left;
    font-size: 14px;
  }

  .preview-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }

  :deep(.v-theme--dark) .preview-table th {
    background-color: #2d2d2d;
  }

  :deep(.v-theme--dark) .preview-table th,
  :deep(.v-theme--dark) .preview-table td {
    border-color: #555;
  }

  .table-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 14px;
  }

  :deep(.v-theme--dark) .table-input {
    background-color: #2d2d2d;
    border-color: #555;
  }

  .hidden-preview {
    font-size: 14px;
    font-style: italic;
    opacity: 0.6;
  }
</style>
