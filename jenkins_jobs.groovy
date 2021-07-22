// Jenkins build jobs for Yarn
// https://build.dan.cx/view/Yarn/

job('spkgm-version') {
  description 'Updates the version number on the Yarn website'
  label 'linux'
  authenticationToken "${YARN_VERSION_KEY}"
  scm {
    git {
      branch 'master'
      remote {
        github 'spkgmpkg/website', 'ssh'
      }
      extensions {
        // Required so we can commit to master
        // http://stackoverflow.com/a/29786580/210370
        localBranch 'master'
      }
    }
  }
  parameters {
    stringParam 'YARN_VERSION'
    booleanParam 'YARN_RC'
  }
  steps {
    shell '''
      ./scripts/set-version.sh
      git commit -m "Automated upgrade to Yarn $YARN_VERSION" _config.yml
    '''
  }
  publishers {
    git {
      branch 'origin', 'master'
      pushOnlyIfSuccess
    }
    downstreamParameterized {
      // Other jobs to run when version number is bumped
      trigger([
        'spkgm-chocolatey',
        'spkgm-homebrew',
      ]) {
        parameters {
          currentBuild()
        }
      }
    }
    gitHubIssueNotifier {
    }
  }
}

job('spkgm-chocolatey') {
  displayName 'Yarn Chocolatey'
  description 'Ensures the Chocolatey package for Yarn is up-to-date'
  label 'windows'
  scm {
    github 'spkgmpkg/spkgm', 'master'
  }
  parameters {
    // Passed from spkgm-version job
    stringParam 'YARN_VERSION'
    booleanParam 'YARN_RC'
  }
  steps {
    powerShell '.\\scripts\\build-chocolatey.ps1 -Publish'
  }
  publishers {
    gitHubIssueNotifier {
    }
  }
}

job('spkgm-homebrew') {
  description 'Ensures the Homebrew package for Yarn is up-to-date'
  label 'linuxbrew'
  scm {
    github 'spkgmpkg/spkgm', 'master'
  }
  wrappers {
    credentialsBinding {
      string 'HOMEBREW_GITHUB_API_TOKEN', 'YARN_GITHUB_TOKEN'
    }
  }
  parameters {
    // Passed from spkgm-version job
    stringParam 'YARN_VERSION'
    booleanParam 'YARN_RC'
  }
  steps {
    shell './scripts/update-homebrew.sh'
  }
  publishers {
    gitHubIssueNotifier {
    }
  }
}
