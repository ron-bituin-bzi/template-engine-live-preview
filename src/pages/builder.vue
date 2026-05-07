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
              v-model="newQuestion.questionLabel"
              label="Question Label"
              hint="Displayed as the question text"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.jsonPath"
              label="Field Name (JSON Path)"
              :hint="jsonPathOverride ? 'Manual override enabled - you can edit freely' : 'Auto-generated from Question Label (click lock to override)'"
              persistent-hint
              density="comfortable"
              class="mb-3"
              :class="{ 'json-path-locked': !jsonPathOverride, 'json-path-unlocked': jsonPathOverride }"
              :readonly="!jsonPathOverride"
              :variant="jsonPathOverride ? 'outlined' : 'filled'"
            >
              <template v-slot:append-inner>
                <v-btn
                  :icon="jsonPathOverride ? 'mdi-lock-open' : 'mdi-lock'"
                  :color="jsonPathOverride ? 'primary' : 'default'"
                  size="x-small"
                  variant="text"
                  @click="toggleJsonPathOverride"
                  density="compact"
                />
              </template>
            </v-text-field>

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
                                'checkbox': 'mdi-checkbox-marked',
                                'note': 'mdi-notebook-edit-outline',
                                'currency-v1': 'mdi-currency-usd',
                                'currency': 'mdi-currency-usd'
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

            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="text-subtitle-2">Prerequisites</label>
                <v-btn
                  size="x-small"
                  variant="outlined"
                  @click="addPrerequisite"
                  prepend-icon="mdi-plus"
                >
                  Add
                </v-btn>
              </div>

              <v-alert
                v-if="newQuestion.prerequisites.length === 0"
                type="info"
                variant="tonal"
                density="compact"
              >
                No prerequisites — this question is always visible.
              </v-alert>

              <div
                v-for="(prereq, index) in newQuestion.prerequisites"
                :key="index"
                class="prereq-card pa-3 mb-2"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption font-weight-bold">Condition {{ index + 1 }}</span>
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="removePrerequisite(index)"
                  />
                </div>

                <v-autocomplete
                  v-model="prereq.questionJsonKey"
                  :items="availableQuestionsForPrereq"
                  item-title="label"
                  item-value="value"
                  label="When Question"
                  density="compact"
                  hide-details
                  class="mb-2"
                />

                <v-text-field
                  v-model="prereq._matchingConditionText"
                  label="Matching Values (comma-separated)"
                  hint="e.g. YES or NSW,QLD,VIC"
                  persistent-hint
                  density="compact"
                  class="mb-2"
                  @blur="parseMatchingCondition(prereq)"
                />

                <v-row dense>
                  <v-col cols="6">
                    <v-select
                      v-model="prereq.relationship"
                      :items="['sibling', 'parent']"
                      label="Relationship"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="prereq.uiOperation"
                      :items="['show', 'hide']"
                      label="Operation"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                </v-row>

                <div
                  v-if="index < newQuestion.prerequisites.length - 1"
                  class="mt-2"
                >
                  <v-chip-group
                    v-model="newQuestion.prerequisiteJoiner"
                    mandatory
                  >
                    <v-chip value="AND" size="small" variant="outlined" filter>AND</v-chip>
                    <v-chip value="OR" size="small" variant="outlined" filter>OR</v-chip>
                  </v-chip-group>
                </div>
              </div>
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
          <div class="form-preview-container"  v-if="newQuestion.inputType === 'note' || newQuestion.inputType === 'docNote'">
            <div class="preview-note">
              <div v-html="newQuestion.questionLabel || 'Note content will be displayed here'"></div>
            </div>
          </div>
          <div class="form-preview-container" v-else>
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

                <!-- Currency v1 -->
                <div v-else-if="newQuestion.inputType === 'currency-v1' || newQuestion.inputType === 'currency'" class="currency-input-wrapper">
                  <div class="currency-icon">
                    <v-icon size="18">mdi-currency-usd</v-icon>
                  </div>
                  <input
                    type="text"
                    class="preview-input currency-input"
                    placeholder="0.00"
                    maxlength="13"
                  />
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
                <div class="d-flex align-center tree-item-wrapper" :style="{ paddingLeft: `${question.depth * 24}px` }">
                  <!-- Tree connector lines -->
                  <div v-if="question.depth > 0" class="tree-connector">
                    <div class="tree-line-vertical"></div>
                    <div class="tree-line-horizontal"></div>
                  </div>
                  
                  <!-- Folder/file icon based on whether it has children -->
                  <v-icon 
                    size="small" 
                    class="mr-2 tree-folder-icon"
                    :color="editingIndex === question.originalIndex ? 'primary' : (question.hasChildren ? 'amber-darken-2' : 'blue-grey')"
                  >
                    {{ question.hasChildren ? 'mdi-folder' : 'mdi-file-document-outline' }}
                  </v-icon>
                  
                  <!-- Input type icon -->
                  <v-icon 
                    size="small"
                    :color="editingIndex === question.originalIndex ? 'error' : 'default'"
                  >
                    {{
                      editingIndex === question.originalIndex ? 'mdi-pencil' : (
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
                          'checkbox': 'mdi-checkbox-marked',
                          'note': 'mdi-notebook-edit-outline',
                          'currency': 'mdi-currency-usd',
                          'currency-v1': 'mdi-currency-usd'
                        }[question.inputType] || 'mdi-help-circle-outline'
                      )
                    }}
                  </v-icon>
                </div>
              </template>
              <v-list-item-title>
                {{ question.questionLabel }}
                <v-chip v-if="question.depth > 0" size="x-small" class="ml-2" variant="outlined">
                  Level {{ question.depth }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ question.jsonPath }} • {{ question.inputType }}
                <span v-if="question.dependentOn" class="text-caption">
                  → child of {{ question.dependentOn }}
                </span>
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

    <!-- Document Preview Section -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h6 pa-0 mb-4">Document Preview</v-card-title>

          <v-tabs v-model="docPreviewTab" class="mb-4">
            <v-tab value="SCD">SCD</v-tab>
            <v-tab value="PRP">PRP</v-tab>
            <v-tab value="COC">COC</v-tab>
          </v-tabs>

          <v-window v-model="docPreviewTab">
            <v-window-item v-for="docType in ['SCD', 'PRP', 'COC']" :key="docType" :value="docType">
              <v-list v-if="getDocVisibleQuestions(docType).length > 0" class="doc-preview-list">
                <v-list-item
                  v-for="(q, idx) in getDocVisibleQuestions(docType)"
                  :key="q.jsonPath"
                >
                  <template v-slot:prepend>
                    <v-chip size="small" class="mr-3" color="primary" variant="tonal">{{ idx + 1 }}</v-chip>
                  </template>
                  <v-list-item-title class="doc-title">{{ q.documentTitle || q.questionLabel }}</v-list-item-title>
                  <v-list-item-subtitle>{{ q.jsonPath }} • {{ q.inputType }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal">
                No questions visible in {{ docType }}.
              </v-alert>
            </v-window-item>
          </v-window>
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const inputTypes = ['text', 'number', 'decimal', 'dropdown', 'address', 'radio', 'checkbox', 'date', 'textarea', 'typeahead', 'table', 'hidden', 'note', 'currency-v1', 'currency']

  const newQuestion = ref({
    jsonPath: '',
    questionLabel: '',
    controlLabel: '',
    inputType: 'text',
    section: 'BusinessDetails',
    documentTitle: '',
    docVisible: [],
    docOrder: null,
    dependentOn: null,
    prerequisites: [],
    prerequisiteJoiner: ''
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
  const jsonPathOverride = ref(false)
  const docPreviewTab = ref('SCD')

  const availableParentQuestions = computed(() => {
    return [
      { label: '(None - Top Level)', value: null },
      ...questions.value.map((q, index) => ({
        label: `${q.questionLabel} (${q.jsonPath})`,
        value: q.jsonPath
      }))
    ]
  })

  const availableQuestionsForPrereq = computed(() => {
    return questions.value.map(q => ({
      label: `${q.questionLabel} (${q.jsonPath})`,
      value: q.jsonPath
    }))
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

  // Auto-generate jsonPath from questionLabel
  const generateJsonPath = (label) => {
    return label.replace(/\s+/g, '')
  }

  // Watch questionLabel and auto-update jsonPath if override is not enabled
  watch(() => newQuestion.value.questionLabel, (newLabel) => {
    if (!jsonPathOverride.value) {
      newQuestion.value.jsonPath = generateJsonPath(newLabel)
    }
  })

  // Toggle jsonPath override mode
  const toggleJsonPathOverride = () => {
    jsonPathOverride.value = !jsonPathOverride.value
  }

  const getQuestionDepth = (question) => {
    let depth = 0
    let current = question
    while (current.dependentOn) {
      depth++
      current = questions.value.find(q => q.jsonPath === current.dependentOn)
      if (!current) break
    }
    return depth
  }

  const hasChildren = (jsonPath) => {
    return questions.value.some(q => q.dependentOn === jsonPath)
  }

  const getQuestionsBySection = (section) => {
    return questions.value
      .map((q, index) => ({ 
        ...q, 
        originalIndex: index,
        depth: getQuestionDepth(q),
        hasChildren: hasChildren(q.jsonPath)
      }))
      .filter(q => q.section === section)
  }

  const getDocVisibleQuestions = (docType) => {
    return questions.value
      .map((q, index) => ({ ...q, _index: index }))
      .filter(q => q.docVisible && q.docVisible.includes(docType))
      .sort((a, b) => {
        const orderA = a.docOrder != null ? a.docOrder : a._index
        const orderB = b.docOrder != null ? b.docOrder : b._index
        return orderA - orderB
      })
  }

  const addPrerequisite = () => {
    newQuestion.value.prerequisites.push({
      questionJsonKey: '',
      relationship: 'sibling',
      uiOperation: 'show',
      matchingCondition: [],
      _matchingConditionText: ''
    })
  }

  const removePrerequisite = (index) => {
    newQuestion.value.prerequisites.splice(index, 1)
  }

  const parseMatchingCondition = (prereq) => {
    if (prereq._matchingConditionText) {
      prereq.matchingCondition = prereq._matchingConditionText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    } else {
      prereq.matchingCondition = []
    }
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
          docOrder: q.Document?.DocOrder ?? null,
          dependentOn: questionDependencyMap[key] || null,
          prerequisites: Array.isArray(q.Prerequisite) ? q.Prerequisite.map(p => ({
            questionJsonKey: p.QuestionJsonKey || '',
            relationship: p.Relationship || 'sibling',
            uiOperation: p.UIOperation || 'show',
            matchingCondition: p.MatchingCondition || [],
            _matchingConditionText: (p.MatchingCondition || []).join(', ')
          })) : [],
          prerequisiteJoiner: q.PrerequisiteJoiner || ''
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
    
    // Check if jsonPath was manually overridden (differs from auto-generated)
    const autoGenerated = generateJsonPath(questions.value[index].questionLabel)
    jsonPathOverride.value = questions.value[index].jsonPath !== autoGenerated
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
      docOrder: null,
      dependentOn: null,
      prerequisites: [],
      prerequisiteJoiner: ''
    }
    jsonPathOverride.value = false
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
          DocOrder: q.docOrder ?? (Object.keys(questionsObj).length + 1),
          DocumentTitle: q.documentTitle || q.questionLabel
        },
        ControlLabel: q.controlLabel || q.questionLabel,
        InputType: q.inputType,
        DefaultValue: "",
        AvailableValue: "",
        Prerequisite: q.prerequisites && q.prerequisites.length > 0
          ? q.prerequisites.map(p => ({
              QuestionJsonKey: p.questionJsonKey,
              Relationship: p.relationship,
              UIOperation: p.uiOperation,
              MatchingCondition: p.matchingCondition
            }))
          : "",
        PrerequisiteJoiner: q.prerequisiteJoiner || "",
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
    const sectionOrder = mappingData.value?.Mapping?.map(m => m.Section) || []
    
    // Helper function to build question hierarchy
    const buildQuestionHierarchy = (parentJsonPath, sectionQuestions) => {
      // Find all direct children of this parent
      const children = sectionQuestions.filter(q => q.dependentOn === parentJsonPath)
      
      return children.map(child => ({
        Question: child.jsonPath,
        DependentQuestion: buildQuestionHierarchy(child.jsonPath, sectionQuestions)
      }))
    }
    
    // Group questions by section
    const sectionMap = {}
    questions.value.forEach(q => {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = []
      }
      sectionMap[q.section].push(q)
    })

    // Build hierarchical structure for each section
    const mapping = []
    const allSections = [...new Set([...sectionOrder, ...Object.keys(sectionMap)])]
    
    allSections
      .filter(section => sectionMap[section]) // Only include sections with questions
      .forEach(section => {
        const sectionQuestions = sectionMap[section]
        
        // Find top-level questions (those without a parent)
        const topLevelQuestions = sectionQuestions.filter(q => !q.dependentOn)
        
        // Build hierarchy for each top-level question
        const questionsWithHierarchy = topLevelQuestions.map(q => ({
          Question: q.jsonPath,
          DependentQuestion: buildQuestionHierarchy(q.jsonPath, sectionQuestions)
        }))
        
        mapping.push({
          Section: section,
          Questions: questionsWithHierarchy,
          DependentSection: []
        })
      })

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
          docOrder: q.Document?.DocOrder ?? null,
          dependentOn: questionDependencyMap[key] || null,
          prerequisites: Array.isArray(q.Prerequisite) ? q.Prerequisite.map(p => ({
            questionJsonKey: p.QuestionJsonKey || '',
            relationship: p.Relationship || 'sibling',
            uiOperation: p.UIOperation || 'show',
            matchingCondition: p.MatchingCondition || [],
            _matchingConditionText: (p.MatchingCondition || []).join(', ')
          })) : [],
          prerequisiteJoiner: q.PrerequisiteJoiner || ''
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
    transform: scale(1.05) translateY(-2px) translateX(4%);
    z-index: 1;
    width: calc(100% - 4%);
    margin-left: 2%;
  }

  .question-editing {
    transform: scale(1.05) translateY(-2px) translateX(4%);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background-color: rgba(233, 30, 99, 0.08) !important;
    border: 2px solid #e91e63;
    /* border: 2px solid #e91e63; */
    z-index: 10;
    width: calc(100% - 8%);
  }

  :deep(.v-theme--dark) .question-editing {
    background-color: rgba(233, 30, 99, 0.15) !important;
    box-shadow: 0 6px 16px rgba(233, 30, 99, 0.3);
  }

  .question-editing:hover {
    transform: scale(1.05) translateY(-2px) translateX(4%);
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

  .currency-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 400px;
  }

  .currency-icon {
    position: absolute;
    left: 12px;
    color: #999;
    font-size: 16px;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .currency-input {
    padding-left: 36px !important;
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
  }

  .preview-note {
    padding: 12px 16px;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
  }

  :deep(.v-theme--dark) .preview-note {
    background-color: #2d2d2d;
    border-color: #555;
  }

  .preview-note b,
  .preview-note strong {
    font-weight: 600;
    color: inherit;
  }

  .preview-note i,
  .preview-note em {
    font-style: italic;
  }

  .preview-note u {
    text-decoration: underline;
  }

  /* File Tree Structure Styles */
  .tree-item-wrapper {
    position: relative;
  }

  .tree-connector {
    position: absolute;
    left: 0;
    width: 24px;
    height: 100%;
    pointer-events: none;
  }

  .tree-line-vertical {
    position: absolute;
    left: 12px;
    top: -16px;
    bottom: 50%;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.2);
  }

  :deep(.v-theme--dark) .tree-line-vertical {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .tree-line-horizontal {
    position: absolute;
    left: 12px;
    top: 50%;
    width: 12px;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.2);
  }

  :deep(.v-theme--dark) .tree-line-horizontal {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .tree-folder-icon {
    flex-shrink: 0;
  }

  .hidden-preview {
    font-size: 14px;
    font-style: italic;
    opacity: 0.6;
  }

  /* JSON Path field visual states */
  .json-path-locked {
    opacity: 0.7;
  }

  .json-path-locked :deep(.v-field__input) {
    cursor: not-allowed;
  }

  .json-path-unlocked {
    opacity: 1;
  }

  .json-path-unlocked :deep(.v-field) {
    background-color: rgba(33, 150, 243, 0.05);
  }

  :deep(.v-theme--dark) .json-path-unlocked :deep(.v-field) {
    background-color: rgba(33, 150, 243, 0.1);
  }

  .doc-preview-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .doc-title {
    white-space: normal;
    line-height: 1.4;
  }

  .prereq-card {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.02);
  }

  :deep(.v-theme--dark) .prereq-card {
    border-color: rgba(255, 255, 255, 0.12);
    background-color: rgba(255, 255, 255, 0.02);
  }
</style>
