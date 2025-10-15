import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  location: 'New York, USA',
  skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express']),
  workExperience: `Senior Full Stack Developer at Tech Corp (2020-Present)
- Led development of scalable web applications
- Managed team of 5 developers
- Implemented CI/CD pipelines

Full Stack Developer at StartupXYZ (2018-2020)
- Built RESTful APIs with Node.js and Express
- Developed responsive frontends with React
- Worked with MongoDB and PostgreSQL databases`,
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Create Profile without Resume
async function testCreateProfile() {
  try {
    log('\n📝 Test 1: Creating user profile...', 'blue');
    
    const formData = new FormData();
    Object.keys(testUser).forEach(key => {
      formData.append(key, testUser[key]);
    });

    const response = await axios.post(`${API_BASE_URL}/profile`, formData, {
      headers: formData.getHeaders(),
    });

    log('✅ Profile created successfully!', 'green');
    log(`Profile Completion: ${response.data.data.profileCompletion}%`, 'yellow');
    log(`User ID: ${response.data.data._id}`, 'yellow');
    return response.data.data;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Test 2: Get Profile by Email
async function testGetProfile(email) {
  try {
    log('\n🔍 Test 2: Fetching user profile...', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/profile/${email}`);
    
    log('✅ Profile fetched successfully!', 'green');
    log(`Name: ${response.data.data.name}`, 'yellow');
    log(`Location: ${response.data.data.location}`, 'yellow');
    log(`Skills: ${response.data.data.skills.join(', ')}`, 'yellow');
    log(`Profile Completion: ${response.data.data.profileCompletion}%`, 'yellow');
    return response.data.data;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Test 3: Get All Profiles
async function testGetAllProfiles() {
  try {
    log('\n📋 Test 3: Fetching all profiles...', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/profile`);
    
    log('✅ Profiles fetched successfully!', 'green');
    log(`Total Users: ${response.data.totalUsers}`, 'yellow');
    log(`Current Page: ${response.data.currentPage}`, 'yellow');
    log(`Total Pages: ${response.data.totalPages}`, 'yellow');
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Test 4: Filter by Skill
async function testFilterBySkill(skill) {
  try {
    log(`\n🔎 Test 4: Filtering profiles by skill "${skill}"...`, 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/profile?skill=${skill}`);
    
    log('✅ Filtered profiles fetched successfully!', 'green');
    log(`Found ${response.data.totalUsers} user(s) with skill "${skill}"`, 'yellow');
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Test 5: Update Profile (Add another user)
async function testUpdateProfile() {
  try {
    log('\n🔄 Test 5: Updating existing profile...', 'blue');
    
    const formData = new FormData();
    formData.append('name', 'John Doe Updated');
    formData.append('email', testUser.email); // Same email to update
    formData.append('location', 'San Francisco, CA');
    formData.append('skills', JSON.stringify(['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS']));
    formData.append('workExperience', testUser.workExperience + '\n\nRecently completed AWS certification.');

    const response = await axios.post(`${API_BASE_URL}/profile`, formData, {
      headers: formData.getHeaders(),
    });

    log('✅ Profile updated successfully!', 'green');
    log(`New Location: ${response.data.data.location}`, 'yellow');
    log(`Skills Count: ${response.data.data.skills.length}`, 'yellow');
    return response.data.data;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Test 6: Create Multiple Profiles
async function testCreateMultipleProfiles() {
  try {
    log('\n👥 Test 6: Creating multiple user profiles...', 'blue');
    
    const users = [
      {
        name: 'Alice Smith',
        email: 'alice.smith@example.com',
        location: 'London, UK',
        skills: JSON.stringify(['Python', 'Django', 'PostgreSQL']),
        workExperience: 'Senior Backend Developer with 6 years of experience in Python and Django.',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        location: 'Toronto, Canada',
        skills: JSON.stringify(['Java', 'Spring Boot', 'Microservices']),
        workExperience: 'Full Stack Java Developer specializing in enterprise applications.',
      },
    ];

    for (const user of users) {
      const formData = new FormData();
      Object.keys(user).forEach(key => {
        formData.append(key, user[key]);
      });

      await axios.post(`${API_BASE_URL}/profile`, formData, {
        headers: formData.getHeaders(),
      });
      log(`✅ Created profile for ${user.name}`, 'green');
    }
    
    log('✅ All profiles created successfully!', 'green');
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

// Run all tests
async function runAllTests() {
  try {
    log('🚀 Starting API Tests...', 'blue');
    log('================================', 'blue');
    
    // Test 1: Create Profile
    await testCreateProfile();
    
    // Test 2: Get Profile
    await testGetProfile(testUser.email);
    
    // Test 3: Get All Profiles
    await testGetAllProfiles();
    
    // Test 4: Filter by Skill
    await testFilterBySkill('JavaScript');
    
    // Test 5: Update Profile
    await testUpdateProfile();
    
    // Test 6: Create Multiple Profiles
    await testCreateMultipleProfiles();
    
    // Final: Get All Profiles Again
    await testGetAllProfiles();
    
    log('\n================================', 'blue');
    log('✅ All tests completed successfully!', 'green');
    log('================================\n', 'blue');
  } catch (error) {
    log('\n================================', 'blue');
    log('❌ Tests failed!', 'red');
    log('================================\n', 'blue');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000');
    log('✅ Server is running!', 'green');
    return true;
  } catch (error) {
    log('❌ Server is not running. Please start the server first with: npm start', 'red');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();
